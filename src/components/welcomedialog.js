import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const INTEREST_TAGS = [
  'การเรียน',
  'โปรเจกต์',
  'วิจัย',
  'งานกลุ่ม',
  'การนำเสนอ',
  'เทคโนโลยี',
  'วิทยาศาสตร์',
  'ศิลปะ',
  'ดนตรี',
  'กีฬา',
  'ภาษา',
  'การตลาด',
  'ธุรกิจ',
  'การเงิน',
  'การออกแบบ'
];

function WelcomeDialog({ open, onClose }) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (tag) => {
    setSelectedInterests(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        interests: selectedInterests,
        darkMode: false,
        displayName: auth.currentUser.displayName || '',
        photoURL: auth.currentUser.photoURL || '',
        createdAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Error saving interests:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          ยินดีต้อนรับสู่ StudyHub!
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography align="center" gutterBottom color="text.secondary">
          เลือกหัวข้อที่คุณสนใจเพื่อให้เราแสดงเนื้อหาที่เหมาะกับคุณ
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mt: 3,
          justifyContent: 'center' 
        }}>
          {INTEREST_TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => toggleInterest(tag)}
              color={selectedInterests.includes(tag) ? 'primary' : 'default'}
              sx={{ 
                borderRadius: '16px',
                '&:hover': {
                  backgroundColor: selectedInterests.includes(tag) 
                    ? 'primary.main' 
                    : 'action.hover'
                }
              }}
            />
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={selectedInterests.length === 0 || isSaving}
          sx={{ 
            minWidth: 200,
            borderRadius: '20px'
          }}
        >
          {isSaving ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'เริ่มใช้งาน'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WelcomeDialog;