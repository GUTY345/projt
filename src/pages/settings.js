import { 
  Container, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Box, 
  Switch, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../firebase/config';  // Add this import at the top
import { deleteDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';  // Add this import
import { useTheme } from '@mui/material/styles';  // Add this import
import Brightness4Icon from '@mui/icons-material/Brightness4';  // Add dark mode icon
import { useContext } from 'react';  // Add this
import { ColorModeContext } from '../theme/ColorModeContext';  // Add this

function Settings() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const user = auth.currentUser;
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add delete account handler
  const handleDeleteAccount = async () => {
    try {
      // Delete user's posts
      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, where('userId', '==', user.uid));
      const postsSnapshot = await getDocs(postsQuery);
      const postDeletions = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));

      // Delete user's notifications
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(notificationsRef, where('userId', '==', user.uid));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notificationDeletions = notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref));

      // Delete user's chat messages
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(messagesRef, where('userId', '==', user.uid));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messageDeletions = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));

      // Wait for all deletions to complete
      await Promise.all([...postDeletions, ...notificationDeletions, ...messageDeletions]);

      // Finally delete the user account
      await user.delete();
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      alert('เกิดข้อผิดพลาดในการลบบัญชี: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          src={user?.photoURL}
          sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
        />
        <Typography variant="h6">{user?.displayName}</Typography>
        <Typography color="text.secondary">{user?.email}</Typography>
      </Box>

      <List>
        <ListItem button onClick={() => navigate('/profile')}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="แก้ไขโปรไฟล์" />
        </ListItem>

        {/* Add dark mode toggle here */}
        <ListItem>
          <ListItemIcon>
            <Brightness4Icon />
          </ListItemIcon>
          <ListItemText primary="โหมดมืด" />
          <Switch
            checked={theme.palette.mode === 'dark'}
            onChange={colorMode.toggleColorMode}
          />
        </ListItem>

        <ListItem button>
          <ListItemIcon><NotificationsIcon /></ListItemIcon>
          <ListItemText primary="การแจ้งเตือน" />
          <Switch
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
        </ListItem>

        <ListItem button>
          <ListItemIcon><SecurityIcon /></ListItemIcon>
          <ListItemText primary="ความปลอดภัย" />
        </ListItem>

        <ListItem button>
          <ListItemIcon><HelpIcon /></ListItemIcon>
          <ListItemText primary="ช่วยเหลือ" />
        </ListItem>

        {/* Add delete account option */}
        <ListItem 
          button 
          onClick={() => setOpenDeleteDialog(true)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="ลบบัญชีผู้ใช้" />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="ออกจากระบบ" />
        </ListItem>
      </List>

      {/* Add confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>ยืนยันการลบบัญชี</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ที่จะลบบัญชีนี้? การดำเนินการนี้ไม่สามารถเรียกคืนได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            variant="contained"
          >
            ยืนยันการลบบัญชี
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Settings;