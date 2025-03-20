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
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
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
      const groupId = groupDoc.id;  // Get the group ID here
      
      await updateDoc(doc(db, 'chatGroups', groupId), {
        members: [...groupDoc.data().members, auth.currentUser.uid]
      });
      
      // Add system message about joining
      await addDoc(collection(db, `chatGroups/${groupId}/messages`), {
        text: `${auth.currentUser.displayName || 'ผู้ใช้'} ได้เข้าร่วมกลุ่ม`,
        createdAt: new Date(),
        isSystemMessage: true
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