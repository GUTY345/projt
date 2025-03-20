import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../firebase/config';

function Navbar({ user }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

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

  return (
    <AppBar position="static" sx={{ bgcolor: '#FF6B6B' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => navigate('/')}
        >
          StudyHub
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/ideas')}
          >
            ไอเดีย
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/chat')}
          >
            แชท
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/moodboard')}
          >
            มู้ดบอร์ด
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/notes')}
          >
            โน้ต
          </Button>
        </Box>

        {user && (
          <Box sx={{ ml: 2 }}>
            <IconButton onClick={handleMenu}>
              <Avatar 
                src={user.photoURL} 
                alt={user.displayName}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
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
    </AppBar>
  );
}

export default Navbar;