import { useState } from 'react';
import { auth } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Container, Box, Button, TextField, Typography, Divider, Alert, Paper, Avatar, InputAdornment, IconButton } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { motion } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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
    setError('');
    setPasswordError('');
    
    try {
      if (isSignUp) {
        // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
        if (password !== confirmPassword) {
          setPasswordError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
          return;
        }
        
        // ตรวจสอบความยาวรหัสผ่าน
        if (password.length < 6) {
          setPasswordError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
          return;
        }
        
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      } else if (error.code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
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
              boxShadow: '0 8px 32px rgba(0,150,136,0.2)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar 
                src="/logo192.png"
                alt="NoteNova"
                sx={{ 
                  width: 70, 
                  height: 70, 
                  mx: 'auto', 
                  mb: 2,
                  boxShadow: '0 4px 12px rgba(0,150,136,0.25)',
                }}
              />
              <Typography variant="h4" fontWeight="600" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {isSignUp ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับกลับมา'}
              </Typography>
              <Typography color="text.secondary">
                {isSignUp ? 'เริ่มต้นใช้งาน NoteNova' : 'เข้าสู่ระบบเพื่อใช้งาน NoteNova'}
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
                borderColor: '#009688',
                color: '#009688',
                borderRadius: '28px',
                '&:hover': {
                  borderColor: '#00796B',
                  bgcolor: 'rgba(0,150,136,0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,150,136,0.15)',
                },
                transition: 'all 0.3s',
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
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#009688',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#009688',
                  },
                }}
                required
              />
              <TextField
                fullWidth
                label="รหัสผ่าน"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ 
                  mb: isSignUp ? 2 : 3,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#009688',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#009688',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />
              
              {isSignUp && (
                <TextField
                  fullWidth
                  label="ยืนยันรหัสผ่าน"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#009688',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#009688',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mb: 3,
                  py: 1.5,
                  borderRadius: 28,
                  bgcolor: '#009688',
                  boxShadow: '0 4px 12px rgba(0,150,136,0.3)',
                  '&:hover': {
                    bgcolor: '#00796B',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,150,136,0.4)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                {isSignUp ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
              </Button>
            </Box>

            <Button
              fullWidth
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPasswordError('');
              }}
              sx={{ 
                textTransform: 'none',
                color: '#009688',
                '&:hover': {
                  bgcolor: 'rgba(0,150,136,0.05)',
                },
              }}
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