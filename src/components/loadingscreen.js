import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: 2,
        background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)'
      }}
    >
      <CircularProgress sx={{ color: 'white' }} size={60} />
      <Typography variant="h6" sx={{ color: 'white' }}>
        กำลังโหลด...
      </Typography>
    </Box>
  );
}

export default LoadingScreen;