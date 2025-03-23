import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Welcome() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            component="img"
            src="/logo192.png"
            alt="MindMesh"
            sx={{
              width: 150,
              height: 150,
              mb: 4,
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          />
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            ยินดีต้อนรับสู่ MindMesh
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            เชื่อมโยงความคิด สร้างสรรค์การเรียนรู้
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/auth')}
            sx={{
              bgcolor: 'white',
              color: '#FF6B6B',
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
            }}
          >
            เริ่มต้นใช้งาน
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Welcome;