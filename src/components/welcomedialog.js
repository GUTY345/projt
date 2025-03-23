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
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const INTEREST_TAGS = [
  'การเรียน', 'โปรเจกต์', 'วิจัย', 'งานกลุ่ม', 'การนำเสนอ',
  'เทคโนโลยี', 'วิทยาศาสตร์', 'ศิลปะ', 'ดนตรี', 'กีฬา',
  'ภาษา', 'การตลาด', 'ธุรกิจ', 'การเงิน', 'การออกแบบ',
  'ความคิดสร้างสรรค์', 'นวัตกรรม', 'การแก้ปัญหา' // เพิ่มแท็กที่เกี่ยวข้องกับ MindMesh
];

function WelcomeDialog({ open, onClose }) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          p: isMobile ? 2 : 3,
          height: isMobile ? '100%' : 'auto',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center',
        pt: isMobile ? 4 : 2
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          fontWeight="bold"
          sx={{ color: theme.palette.primary.main }}
        >
          ยินดีต้อนรับสู่ MindMesh!
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography 
          align="center" 
          gutterBottom 
          color="text.secondary"
          sx={{ 
            maxWidth: '80%',
            mb: 4,
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          เลือกหัวข้อที่สนใจเพื่อเชื่อมโยงกับผู้ใช้ที่มีความสนใจเดียวกัน
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: isMobile ? 0.8 : 1, 
          justifyContent: 'center',
          maxWidth: isMobile ? '100%' : '90%'
        }}>
          {INTEREST_TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => toggleInterest(tag)}
              color={selectedInterests.includes(tag) ? 'primary' : 'default'}
              sx={{ 
                m: 0.5,
                borderRadius: '16px',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                height: isMobile ? '28px' : '32px',
                '&:hover': {
                  backgroundColor: selectedInterests.includes(tag) 
                    ? theme.palette.primary.dark 
                    : theme.palette.action.hover,
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s'
                },
                transition: 'all 0.2s'
              }}
            />
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'center', 
        p: isMobile ? 2 : 3,
        pb: isMobile ? 4 : 3
      }}>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={selectedInterests.length === 0 || isSaving}
          sx={{ 
            minWidth: isMobile ? '80%' : 200,
            borderRadius: '20px',
            py: 1.5,
            fontSize: isMobile ? '0.9rem' : '1rem',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.2s'
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