import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion,
  addDoc,  // Add this
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const JoinGroupDialog = ({ open, onClose }) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Convert to uppercase and trim whitespace
      const formattedCode = joinCode.trim().toUpperCase();
      
      // Query groups with matching joinCode
      const groupsQuery = await getDocs(
        query(
          collection(db, 'chatGroups'),
          where('joinCode', '==', formattedCode)
        )
      );

      if (groupsQuery.empty) {
        setError('ไม่พบกลุ่มที่ตรงกับรหัสนี้');
        return;
      }

      const groupDoc = groupsQuery.docs[0];
      const groupData = groupDoc.data();

      // Check if group is still private
      if (!groupData.isPrivate) {
        setError('กลุ่มนี้ไม่ใช่กลุ่มส่วนตัวแล้ว');
        return;
      }

      // Check if user already member
      if (groupData.members.includes(auth.currentUser.uid)) {
        setError('คุณเป็นสมาชิกกลุ่มนี้อยู่แล้ว');
        return;
      }

      // Add user to members
      await updateDoc(doc(db, 'chatGroups', groupDoc.id), {
        members: arrayUnion(auth.currentUser.uid)
      });

      // Add join message
      await addDoc(collection(db, `chatGroups/${groupDoc.id}/messages`), {
        text: `${auth.currentUser.displayName} ได้เข้าร่วมกลุ่ม`,
        createdAt: serverTimestamp(),
        isSystemMessage: true
      });

      onClose();
      setJoinCode('');
    } catch (err) {
      console.error('Join error:', err);
      setError('เกิดข้อผิดพลาดในการเข้าร่วมกลุ่ม');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>เข้าร่วมกลุ่มด้วยรหัส</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="รหัสเข้าร่วมกลุ่ม"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            inputProps={{ maxLength: 6 }}
          />
          {error && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button
          onClick={handleJoin}
          color="primary"
          variant="contained"
          disabled={!joinCode.trim() || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'เข้าร่วมกลุ่ม'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinGroupDialog;