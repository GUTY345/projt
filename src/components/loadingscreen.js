import { Box, CircularProgress, Typography, keyframes } from '@mui/material';
import { useEffect, useState } from 'react';

function LoadingScreen() {
  const [loadingText, setLoadingText] = useState('กำลังโหลด');
  
  // สร้างแอนิเมชั่นสำหรับข้อความโหลด
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === 'กำลังโหลด...') return 'กำลังโหลด';
        if (prev === 'กำลังโหลด') return 'กำลังโหลด.';
        if (prev === 'กำลังโหลด.') return 'กำลังโหลด..';
        return 'กำลังโหลด...';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // สร้าง keyframes สำหรับแอนิเมชั่น
  const pulse = keyframes`
    0% { transform: scale(0.95); opacity: 0.7; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.7; }
  `;
  
  const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: 3,
        background: 'linear-gradient(135deg, #4A90E2 0%, #67B26F 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* เพิ่มองค์ประกอบพื้นหลัง */}
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
        background: 'radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent) 50px 50px',
        backgroundSize: '100px 100px'
      }} />
      
      {/* โลโก้หรือไอคอนแอป */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700,
          letterSpacing: '-1px',
          mb: 1,
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: `${float} 3s ease-in-out infinite`,
          textShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}
      >
        MindMesh
      </Typography>
      
      {/* วงกลมโหลดแบบใหม่ */}
      <Box sx={{ 
        position: 'relative',
        width: 80,
        height: 80,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: `${pulse} 2s ease-in-out infinite`
      }}>
        <CircularProgress 
          sx={{ 
            color: 'white',
            position: 'absolute'
          }} 
          size={80} 
          thickness={2}
        />
        <CircularProgress 
          sx={{ 
            color: 'rgba(255,255,255,0.5)',
            position: 'absolute'
          }} 
          size={60} 
          thickness={4}
          variant="determinate"
          value={75}
        />
      </Box>
      
      {/* ข้อความโหลดแบบมีแอนิเมชั่น */}
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'white',
          fontWeight: 500,
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          mt: 1
        }}
      >
        {loadingText}
      </Typography>
      
      {/* ข้อความเพิ่มเติม */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'rgba(255,255,255,0.8)',
          position: 'absolute',
          bottom: 20,
          textAlign: 'center',
          maxWidth: '80%'
        }}
      >
        กำลังเตรียมพื้นที่สำหรับความคิดสร้างสรรค์ของคุณ
      </Typography>
    </Box>
  );
}

export default LoadingScreen;