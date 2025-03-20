import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
          <Box sx={{ ml: 2 }}>
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
          </Box>
        )}
      </Toolbar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better mobile performance
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