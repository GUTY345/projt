import { useState } from 'react';
import { auth } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Container, Box, Button, TextField, Typography, Divider, Alert, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { motion } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="600" gutterBottom>
                {isSignUp ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับกลับมา'}
              </Typography>
              <Typography color="text.secondary">
                {isSignUp ? 'เริ่มต้นใช้งาน StudyHub' : 'เข้าสู่ระบบเพื่อใช้งาน StudyHub'}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                mb: 3,
                py: 1.5,
                borderColor: '#DB4437',
                color: '#DB4437',
                '&:hover': {
                  borderColor: '#C73B2E',
                  bgcolor: 'rgba(219,68,55,0.05)',
                },
              }}
            >
              เข้าสู่ระบบด้วย Google
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography color="text.secondary">หรือ</Typography>
            </Divider>

            <Box component="form" onSubmit={handleEmailAuth}>
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="รหัสผ่าน"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(255,107,107,0.2)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(255,107,107,0.3)',
                  },
                }}
              >
                {isSignUp ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
              </Button>
            </Box>

            <Button
              fullWidth
              onClick={() => setIsSignUp(!isSignUp)}
              sx={{ textTransform: 'none' }}
            >
              {isSignUp ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Auth;