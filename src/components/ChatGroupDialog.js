import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

function ChatGroupDialog({ open, onClose }) {
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });

  const generateGroupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreate = async () => {
    try {
      const code = groupData.isPrivate ? generateGroupCode() : null;
      await addDoc(collection(db, 'chatGroups'), {
        name: groupData.name,
        description: groupData.description,
        isPrivate: groupData.isPrivate,
        groupCode: code,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        members: [auth.currentUser.uid],
        memberCount: 1
      });
      onClose();
      setGroupData({
        name: '',
        description: '',
        isPrivate: false,
      });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>สร้างกลุ่มแชทใหม่</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="ชื่อกลุ่ม"
            value={groupData.name}
            onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
            placeholder="ตั้งชื่อกลุ่มของคุณ"
          />
          <TextField
            fullWidth
            label="คำอธิบาย"
            multiline
            rows={3}
            value={groupData.description}
            onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
            placeholder="อธิบายเกี่ยวกับกลุ่มของคุณ"
          />
          <FormControlLabel
            control={
              <Switch
                checked={groupData.isPrivate}
                onChange={(e) => setGroupData({ ...groupData, isPrivate: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">กลุ่มส่วนตัว</Typography>
                <Typography variant="caption" color="text.secondary">
                  {groupData.isPrivate 
                    ? "สมาชิกต้องใช้รหัสในการเข้าร่วมกลุ่ม" 
                    : "ทุกคนสามารถเข้าร่วมกลุ่มได้"}
                </Typography>
              </Box>
            }
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
}

export default ChatGroupDialog;