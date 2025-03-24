import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText, Dialog, DialogContent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';  // รวม useLocation ไว้ที่นี่
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { Badge, Popover } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { /* existing imports */ } from '@mui/material';
// เพิ่ม imports สำหรับไอคอน
import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChatIcon from '@mui/icons-material/Chat';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import NotesIcon from '@mui/icons-material/Notes';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { limit } from 'firebase/firestore';

function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();  // เพิ่ม location
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'หน้าแรก', path: '/', icon: <HomeIcon /> },
    { text: 'ไอเดีย', path: '/ideas', icon: <LightbulbIcon /> },
    { text: 'แชท', path: '/chat', icon: <ChatIcon /> },
    // ปิดหน้า moodboard ชั่วคราว แต่ยังแสดงในเมนู
    { text: 'มู้ดบอร์ด', path: '/moodboard-disabled', icon: <ColorLensIcon /> },
    { text: 'โน้ต', path: '/notes', icon: <NotesIcon /> }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // เพิ่ม state สำหรับ modal แจ้งเตือน
  const [openMoodboardAlert, setOpenMoodboardAlert] = useState(false);

  // เพิ่มฟังก์ชันสำหรับจัดการการนำทางไปยังหน้าต่างๆ
  // แก้ไขฟังก์ชัน handleNavigation ให้ทำงานถูกต้อง
  const handleNavigation = (path) => {
    if (path === '/moodboard-disabled') {
      // แสดง modal แจ้งเตือนแทนการนำทางไปยังหน้า moodboard
      setOpenMoodboardAlert(true);
    } else {
      navigate(path);
    }
    
    // ปิด drawer ถ้าเปิดอยู่
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const drawer = (
    <Box sx={{ pt: 2 }}>
      <Typography
        variant="h6"
        sx={{
          textAlign: 'center',
          mb: 3,
          fontWeight: 600,
          background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        NoteNova
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              handleDrawerToggle();
            }}
            sx={{
              mb: 1,
              borderRadius: '0 25px 25px 0',
              mr: 2,
              '&:hover': {
                bgcolor: 'rgba(0, 150, 136, 0.1)',
              }
            }}
          >
            <Box
              sx={{
                mr: 2,
                color: '#009688',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {item.icon}
            </Box>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Query notifications for both chat messages and new posts
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid),
        where('type', 'in', ['chat', 'post']), // เพิ่มการกรองประเภทการแจ้งเตือน
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleNotificationClick = async (event, notification = null) => {
    if (notification) {
      // กรณีคลิกที่การแจ้งเตือน
      if (!notification.read) {
        try {
          const notificationRef = doc(db, 'notifications', notification.id);
          await updateDoc(notificationRef, {
            read: true
          });
        } catch (error) {
          console.error('Error updating notification:', error);
        }
      }
      handleNotificationClose();
      if (notification.link) {
        navigate(notification.link);
      }
    } else {
      // กรณีคลิกที่ไอคอนการแจ้งเตือน
      setNotificationAnchorEl(event.currentTarget);
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      // อัพเดททุกการแจ้งเตือนที่ยังไม่ได้อ่าน
      const promises = notifications.map(notification => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          return updateDoc(notificationRef, { read: true });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      handleNotificationClose();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // ลบฟังก์ชัน handleNavigationClick ที่ซ้ำออก

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          top: 0,
          pt: { xs: 'env(safe-area-inset-top)', sm: 0 },  // Add padding for iOS safe area
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: { xs: 'calc(70px + env(safe-area-inset-top))', sm: 'auto' }  // Adjust height
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            px: { xs: 2, sm: 4 },
            minHeight: { xs: '70px', sm: '64px' },
            mt: { xs: 'env(safe-area-inset-top)', sm: 0 }  // Add margin for content
          }}
        >
          {isMobile ? (
            <>
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1,
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NoteNova
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={(e) => handleNotificationClick(e)}
                  sx={{ color: '#666' }}
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton onClick={handleMenu}>
                  <Avatar 
                    src={user.photoURL} 
                    alt={user.displayName}
                    sx={{ 
                      width: 34,
                      height: 34,
                      border: '2px solid #009688',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                </IconButton>
              </Box>
            </>
          ) : (
            <>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mr: 4
                }}
              >
                NoteNova
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
                {menuItems.map((item) => (
                  <Button 
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: location.pathname === item.path ? '#009688' : '#666',
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 150, 136, 0.08)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                <IconButton 
                  onClick={(e) => handleNotificationClick(e)}
                  sx={{ 
                    color: '#666',
                    '&:hover': { color: '#009688' }
                  }}
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton 
                  onClick={handleMenu}
                  sx={{ 
                    p: 0.5,
                    '&:hover': { bgcolor: 'rgba(74, 144, 226, 0.08)' }
                  }}
                >
                  <Avatar 
                    src={user.photoURL} 
                    alt={user.displayName}
                    sx={{ 
                      width: 38,
                      height: 38,
                      border: '2px solid #009688',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Adjust spacing for taller navbar and iOS safe area */}
      <Box sx={{ 
        height: { xs: 'calc(70px + env(safe-area-inset-top))', sm: '64px' },
        width: '100%'
      }} />
      
      {isMobile && user && (
        <AppBar 
          position="fixed" 
          color="inherit"
          sx={{ 
            top: 'auto', 
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 1200
          }}
        >
          <Toolbar sx={{ 
            justifyContent: 'space-around', 
            minHeight: '56px',
            px: 1
          }}>
            {menuItems.map((item) => (
              <IconButton
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: location.pathname === item.path ? '#009688' : '#666',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  padding: '4px',
                  minWidth: '48px'
                }}
              >
                {item.icon}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.65rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.text}
                </Typography>
              </IconButton>
            ))}
          </Toolbar>
        </AppBar>
      )}
      
      {/* ปรับ padding สำหรับ bottom navigation */}
      {isMobile && <Box sx={{ height: '56px', width: '100%' }} />}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 120
          }
        }}
      >
        <MenuItem onClick={() => {
          handleClose();
          navigate('/profile');
        }}>
          โปรไฟล์
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          ออกจากระบบ
        </MenuItem>
      </Menu>

      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 300,
            maxHeight: 400,
            p: 2
          }
        }}
      >
        
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>การแจ้งเตือน</span>
          {notifications.length > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => handleMarkAllAsRead()}
            >
              อ่านทั้งหมด
            </Typography>
          )}
        </Typography>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                p: 1.5,
                mb: 1,
                bgcolor: notification.read ? 'transparent' : 'rgba(74, 144, 226, 0.08)',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(74, 144, 226, 0.12)' },
                border: '1px solid',
                borderColor: notification.read ? 'transparent' : 'rgba(74, 144, 226, 0.2)'
              }}
              onClick={(e) => handleNotificationClick(e, notification)}
            >
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {notification.message}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {notification.type === 'post' ? '🔔 โพสต์ใหม่' : '💬 ข้อความใหม่'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.createdAt?.toLocaleString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  })}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            <NotificationsOffIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography>ไม่มีการแจ้งเตือนใหม่</Typography>
          </Box>
        )}
      </Popover>
      
      {/* เพิ่ม Dialog สำหรับแจ้งเตือนเมื่อผู้ใช้พยายามเข้าถึงหน้า Moodboard */}
      <Dialog
        open={openMoodboardAlert}
        onClose={() => setOpenMoodboardAlert(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
            maxWidth: '400px'
          }
        }}
      >
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            ฟีเจอร์ปิดปรับปรุงชั่วคราว
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            ขออภัย ฟีเจอร์มู้ดบอร์ดกำลังอยู่ระหว่างการปรับปรุงเพื่อแก้ไขข้อผิดพลาด จะกลับมาให้บริการเร็วๆ นี้
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => setOpenMoodboardAlert(false)} 
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              เข้าใจแล้ว
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Navbar;