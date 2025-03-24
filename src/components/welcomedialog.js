import { useState, useEffect } from 'react';
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
  useMediaQuery,
  Avatar,
  Fade
} from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { motion } from 'framer-motion';

const INTEREST_TAGS = [
  'การเรียน', 'โปรเจกต์', 'วิจัย', 'งานกลุ่ม', 'การนำเสนอ',
  'เทคโนโลยี', 'วิทยาศาสตร์', 'ศิลปะ', 'ดนตรี', 'กีฬา',
  'ภาษา', 'การตลาด', 'ธุรกิจ', 'การเงิน', 'การออกแบบ',
  'ความคิดสร้างสรรค์', 'นวัตกรรม', 'การแก้ปัญหา', 'การจดบันทึก', 'การจัดการเวลา'
];

function WelcomeDialog({ open, onClose }) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [animateChips, setAnimateChips] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // เพิ่ม animation เมื่อ dialog เปิด
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setAnimateChips(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimateChips(false);
    }
  }, [open]);

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

  // สร้างสีพื้นหลังแบบ gradient
  const gradientBackground = 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          p: isMobile ? 2 : 0,
          height: isMobile ? '100%' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 150, 136, 0.2)',
          border: '1px solid rgba(0, 150, 136, 0.1)'
        }
      }}
    >
      <Box sx={{ 
        background: gradientBackground,
        pt: isMobile ? 6 : 4,
        pb: 3,
        px: 3,
        textAlign: 'center',
        color: 'white'
      }}>
        <Avatar 
          src="/logo192.png"
          alt="NoteNova"
          sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '3px solid white'
          }}
        />
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          fontWeight="bold"
          sx={{ mb: 1 }}
        >
          ยินดีต้อนรับสู่ NoteNova!
        </Typography>
        <Typography 
          variant="body1"
          sx={{ 
            opacity: 0.9,
            maxWidth: '80%',
            mx: 'auto',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          เลือกหัวข้อที่สนใจเพื่อปรับแต่งประสบการณ์การใช้งานของคุณ
        </Typography>
      </Box>

      <DialogContent sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pt: 4,
        pb: 3
      }}>
        <Typography 
          variant="subtitle1"
          fontWeight="500"
          sx={{ mb: 3, color: '#009688' }}
        >
          เลือกอย่างน้อย 1 หัวข้อที่คุณสนใจ
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: isMobile ? 0.8 : 1, 
          justifyContent: 'center',
          maxWidth: isMobile ? '100%' : '90%'
        }}>
          {INTEREST_TAGS.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              animate={animateChips ? { 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: index * 0.03,
                  duration: 0.3
                }
              } : {}}
            >
              <Chip
                label={tag}
                onClick={() => toggleInterest(tag)}
                color={selectedInterests.includes(tag) ? 'primary' : 'default'}
                sx={{ 
                  m: 0.5,
                  borderRadius: '16px',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  height: isMobile ? '32px' : '36px',
                  fontWeight: selectedInterests.includes(tag) ? 500 : 400,
                  bgcolor: selectedInterests.includes(tag) ? '#009688' : 'rgba(0, 150, 136, 0.08)',
                  color: selectedInterests.includes(tag) ? 'white' : '#333',
                  border: selectedInterests.includes(tag) ? 'none' : '1px solid rgba(0, 150, 136, 0.2)',
                  '&:hover': {
                    backgroundColor: selectedInterests.includes(tag) 
                      ? '#00796B' 
                      : 'rgba(0, 150, 136, 0.15)',
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s'
                  },
                  transition: 'all 0.2s'
                }}
              />
            </motion.div>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'center', 
        p: 3,
        pb: isMobile ? 6 : 4,
        bgcolor: 'rgba(0, 150, 136, 0.03)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={animateChips ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.3 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={selectedInterests.length === 0 || isSaving}
            sx={{ 
              minWidth: isMobile ? '80%' : 220,
              borderRadius: '28px',
              py: 1.5,
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: 500,
              bgcolor: '#009688',
              boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
              '&:hover': {
                bgcolor: '#00796B',
                boxShadow: '0 6px 16px rgba(0, 150, 136, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 150, 136, 0.3)',
                color: 'rgba(255, 255, 255, 0.6)'
              },
              transition: 'all 0.3s'
            }}
          >
            {isSaving ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'เริ่มใช้งาน NoteNova'
            )}
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
}

export default WelcomeDialog;