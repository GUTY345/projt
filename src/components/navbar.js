import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText } from '@mui/material';
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
    { text: 'มู้ดบอร์ด', path: '/moodboard', icon: <ColorLensIcon /> },
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
          background: 'linear-gradient(135deg, #4A90E2 0%, #67B26F 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        MindMesh
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
                bgcolor: 'rgba(74, 144, 226, 0.1)',
              }
            }}
          >
            <Box
              sx={{
                mr: 2,
                color: '#4A90E2',
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
      // Query for notifications
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
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

  // ลบฟังก์ชัน handleNotificationClick ที่ซ้ำออก

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          top: 0,
          zIndex: 1200 // เพิ่ม zIndex
        }}
      >
        <Toolbar>
          {isMobile ? (
            <>
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  background: 'linear-gradient(135deg, #4A90E2 0%, #67B26F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                MindMesh
              </Typography>
              <IconButton 
                onClick={(e) => handleNotificationClick(e)}
                sx={{ 
                  color: '#666',
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton 
                onClick={handleMenu}
                sx={{ ml: 1 }}
              >
                <Avatar 
                  src={user.photoURL} 
                  alt={user.displayName}
                  sx={{ 
                    width: 32,
                    height: 32,
                    border: '2px solid #4A90E2'
                  }}
                />
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button 
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    color: location.pathname === item.path ? '#4A90E2' : '#666',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(74, 144, 226, 0.08)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* ปรับ padding สำหรับ fixed navbar */}
      <Box sx={{ 
        height: { xs: '56px', sm: '64px' },
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
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? '#4A90E2' : '#666',
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
        <Typography variant="h6" sx={{ mb: 2 }}>การแจ้งเตือน</Typography>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                p: 1,
                mb: 1,
                bgcolor: notification.read ? 'transparent' : '#f5f5f5',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#eee' }
              }}
              onClick={(e) => handleNotificationClick(e, notification)}
            >
              <Typography variant="body2">
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.type === 'post' ? '🔔 โพสต์ใหม่' : '💬 ข้อความใหม่'}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            ไม่มีการแจ้งเตือนใหม่
          </Typography>
        )}
      </Popover>
    </>
  );
}

export default Navbar;