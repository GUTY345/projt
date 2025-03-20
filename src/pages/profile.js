import { useState, useEffect } from 'react';
import {
  Container, Box, Avatar, Typography, Button, TextField,
  Chip, Switch, FormControlLabel, Paper, Grid, CircularProgress,
  IconButton, useTheme, useMediaQuery, Snackbar, Alert, Skeleton
} from '@mui/material';
import { auth, db, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const INTEREST_TAGS = [
  'การเรียน', 'โปรเจกต์', 'วิจัย', 'งานกลุ่ม', 'การนำเสนอ',
  'เทคโนโลยี', 'วิทยาศาสตร์', 'ศิลปะ', 'ดนตรี', 'กีฬา',
  'ภาษา', 'การตลาด', 'ธุรกิจ', 'การเงิน', 'การออกแบบ'
];

function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profile, setProfile] = useState({
    displayName: '',
    interests: [],
    darkMode: false,
    photoURL: ''
  });
  const [stats, setStats] = useState({ ideas: 0, moodboards: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      setProfile({ ...userDoc.data() });
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const statsDoc = await getDoc(doc(db, 'userStats', auth.currentUser.uid));
    if (statsDoc.exists()) {
      setStats(statsDoc.data());
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const storageRef = ref(storage, `profiles/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL });
        setProfile({ ...profile, photoURL });
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
      setUploading(false);
    }
  };

  const toggleInterest = (tag) => {
    const newInterests = profile.interests.includes(tag)
      ? profile.interests.filter(t => t !== tag)
      : [...profile.interests, tag];
    setProfile({ ...profile, interests: newInterests });
  };

  const handleSaveProfile = async () => {
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), profile);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'บันทึกข้อมูลสำเร็จ', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4 }}>
        <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={120} height={120} />
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4 }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', position: 'relative' }}>
          <input
            type="file"
            accept="image/*"
            id="photo-upload"
            hidden
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
          <label htmlFor="photo-upload">
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={profile.photoURL || auth.currentUser?.photoURL}
                sx={{ 
                  width: isMobile ? 100 : 120, 
                  height: isMobile ? 100 : 120, 
                  mx: 'auto', 
                  mb: 2,
                  cursor: 'pointer',
                  border: '4px solid white',
                  boxShadow: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { 
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s'
                }}
                size={isMobile ? "small" : "medium"}
              >
                <PhotoCameraIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Box>
          </label>

          {isEditing ? (
            <TextField
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="h5" gutterBottom>
              {profile.displayName || auth.currentUser?.email}
              <IconButton onClick={() => setIsEditing(true)} size="small">
                <EditIcon />
              </IconButton>
            </Typography>
          )}
        </Box>

        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Paper 
              sx={{ 
                p: isMobile ? 2 : 3, 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                {stats.ideas}
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"}>
                ไอเดียที่แชร์
              </Typography>
            </Paper>
          </Grid>
          {/* Similar adjustment for the second Grid item */}
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            ความสนใจ
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: isMobile ? 0.5 : 1,
            justifyContent: 'center' 
          }}>
            {INTEREST_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => toggleInterest(tag)}
                color={profile.interests.includes(tag) ? 'primary' : 'default'}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  borderRadius: '16px',
                  m: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            sx={{
              minWidth: isMobile ? '100%' : 200,
              borderRadius: '20px',
              py: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
          >
            บันทึกการเปลี่ยนแปลง
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;