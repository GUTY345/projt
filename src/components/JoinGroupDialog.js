import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

function JoinGroupDialog({ open, onClose }) {
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    try {
      const q = query(
        collection(db, 'chatGroups'),
        where('groupCode', '==', groupCode)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('ไม่พบกลุ่มที่ตรงกับรหัส');
        return;
      }

      const groupDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'chatGroups', groupDoc.id), {
        members: [...groupDoc.data().members, auth.currentUser.uid]
      });
      
      onClose();
    } catch (error) {
      console.error('Error joining group:', error);
      setError('เกิดข้อผิดพลาดในการเข้าร่วมกลุ่ม');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>เข้าร่วมกลุ่มส่วนตัว</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, width: 300 }}>
          <TextField
            fullWidth
            label="รหัสกลุ่ม"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button 
          onClick={handleJoin}
          variant="contained"
          disabled={!groupCode.trim()}
        >
          เข้าร่วม
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default JoinGroupDialog;