import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Paper, Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function Welcome() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [particles, setParticles] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // สร้างอนุภาคพื้นหลังเมื่อโหลดหน้า
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 10 + 5,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 20 + 10
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // ตรวจจับเหตุการณ์ beforeinstallprompt สำหรับการติดตั้ง PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // ป้องกันไม่ให้ Chrome แสดง prompt ทันที
      e.preventDefault();
      // เก็บเหตุการณ์เพื่อใช้ภายหลัง
      setDeferredPrompt(e);
      // แสดงปุ่มติดตั้งของเรา
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // ตรวจสอบว่าเป็นอุปกรณ์มือถือและยังไม่ได้ติดตั้ง
    if (isMobile && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowSnackbar(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // แสดง prompt การติดตั้ง
    deferredPrompt.prompt();
    // รอให้ผู้ใช้ตอบกลับ prompt
    const { outcome } = await deferredPrompt.userChoice;
    // ไม่ว่าผลลัพธ์จะเป็นอย่างไร เราไม่สามารถใช้ prompt อีกได้
    setDeferredPrompt(null);
    // ซ่อนปุ่มติดตั้ง
    setShowInstallPrompt(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',  // ปรับสีให้เป็นโทน teal ตามธีม NoteNova
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* อนุภาคพื้นหลังเคลื่อนไหว */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          component={motion.div}
          sx={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            opacity: particle.opacity,
            zIndex: 0,
          }}
          initial={{ x: `${particle.x}vw`, y: `${particle.y}vh` }}
          animate={{
            y: [`${particle.y}vh`, `${(particle.y + 20) % 100}vh`],
            x: [`${particle.x}vw`, `${(particle.x + 10) % 100}vw`],
          }}
          transition={{
            duration: particle.speed,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, 0, -5, 0],
              scale: [1, 1.05, 1, 1.05, 1]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              repeatType: 'loop'
            }}
          >
            <Box
              component="img"
              src="/logo192.png"
              alt="NoteNova"
              sx={{
                width: 150,
                height: 150,
                mb: 4,
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
              ยินดีต้อนรับสู่ NoteNova
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              จดบันทึกอัจฉริยะ จัดการความคิดของคุณ
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/auth')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'white',
                color: '#009688',  // ปรับสีตัวอักษรให้ตรงกับธีมหลัก
                px: 6,
                py: 1.5,
                fontSize: '1.2rem',
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              เริ่มต้นใช้งาน
            </Button>
          </motion.div>
          
          {showInstallPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  mt: 4, 
                  p: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" sx={{ color: '#009688', mb: 1 }}>
                  ติดตั้งแอพลงในอุปกรณ์ของคุณเพื่อการใช้งานที่ดีขึ้น
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddToHomeScreenIcon />}
                  onClick={handleInstallClick}
                  sx={{ 
                    color: '#009688', 
                    borderColor: '#009688',
                    '&:hover': { 
                      borderColor: '#00796B',
                      bgcolor: 'rgba(0, 150, 136, 0.1)'
                    }
                  }}
                >
                  ติดตั้งแอพ
                </Button>
              </Paper>
            </motion.div>
          )}
        </motion.div>
      </Container>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={10000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          icon={<AddToHomeScreenIcon />}
          onClose={() => setShowSnackbar(false)}
          sx={{ 
            width: '100%',
            bgcolor: 'white',
            color: '#009688',
            '& .MuiAlert-icon': { color: '#009688' }
          }}
        >
          เพิ่ม NoteNova ลงในหน้าจอหลักเพื่อการใช้งานที่ดีขึ้น
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Welcome;