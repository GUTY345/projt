import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { Badge, Popover } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

function Navbar({ user }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'ไอเดีย', path: '/ideas' },
    { text: 'แชท', path: '/chat' },
    { text: 'มู้ดบอร์ด', path: '/moodboard' },
    { text: 'โน้ต', path: '/notes' }
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
    <List>
      {menuItems.map((item) => (
        <ListItem 
          button 
          key={item.text}
          onClick={() => {
            navigate(item.path);
            handleDrawerToggle();
          }}
        >
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
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

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#FF6B6B' }}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: isMobile ? '1.2rem' : '1.5rem'
          }}
          onClick={() => navigate('/')}
        >
          StudyHub
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuItems.map((item) => (
              <Button 
                key={item.text}
                color="inherit" 
                onClick={() => navigate(item.path)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationClick}
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleMenu}>
              <Avatar 
                src={user.photoURL} 
                alt={user.displayName}
                sx={{ 
                  width: isMobile ? 28 : 32, 
                  height: isMobile ? 28 : 32,
                  border: '2px solid white'
                }}
              />
            </IconButton>
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
                    onClick={() => {
                      handleNotificationClose();
                      navigate(notification.link);
                    }}
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
          </Box>
        )}
      </Toolbar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            bgcolor: '#FFF'
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
);
}

export default Navbar;