import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const ChatGroupDialog = ({ open, onClose }) => {
  const [groupData, setGroupData] = useState({
    name: '',
    isPrivate: false
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const joinCode = groupData.isPrivate ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;
      
      await addDoc(collection(db, 'chatGroups'), {
        name: groupData.name,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        members: [auth.currentUser.uid],
        isPrivate: groupData.isPrivate,
        joinCode: joinCode
      });

      setGroupData({ name: '', isPrivate: false });
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>สร้างกลุ่มใหม่</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleCreate} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="ชื่อกลุ่ม"
            value={groupData.name}
            onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={groupData.isPrivate}
                onChange={(e) => setGroupData({ ...groupData, isPrivate: e.target.checked })}
              />
            }
            label="กลุ่มส่วนตัว"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button 
          onClick={handleCreate}
          variant="contained" 
          disabled={!groupData.name.trim()}
        >
          สร้างกลุ่ม
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatGroupDialog;