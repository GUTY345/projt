import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        zIndex: 9999,
      }}
    >
      <Box
        component="img"
        src="/logo192.png"
        alt="StudyHub"
        sx={{
          width: 120,
          height: 120,
          animation: `${pulse} 1.5s infinite ease-in-out`,
          mb: 3
        }}
      />
      <CircularProgress
        sx={{
          color: 'white',
          mb: 2
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          fontWeight: 500,
          textAlign: 'center',
          px: 2
        }}
      >
        กำลังโหลด StudyHub...
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'white',
          opacity: 0.8,
          mt: 1
        }}
      >
        แชร์ไอเดีย เรียนรู้ร่วมกัน
      </Typography>
    </Box>
  );
};

export default LoadingScreen;