import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  CircularProgress,
  IconButton
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
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
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
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  cursor: 'pointer'
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                size="small"
              >
                <PhotoCameraIcon />
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

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{stats.ideas}</Typography>
              <Typography>ไอเดียที่แชร์</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{stats.moodboards}</Typography>
              <Typography>มู้ดบอร์ด</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>ความสนใจ</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {INTEREST_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => toggleInterest(tag)}
                color={profile.interests.includes(tag) ? 'primary' : 'default'}
                sx={{ 
                  borderRadius: '16px',
                  '&:hover': {
                    bgcolor: profile.interests.includes(tag) 
                      ? 'primary.main' 
                      : 'action.hover'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={profile.darkMode}
              onChange={(e) => setProfile({ ...profile, darkMode: e.target.checked })}
            />
          }
          label="โหมดกลางคืน"
        />

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            sx={{
              minWidth: 200,
              borderRadius: '20px'
            }}
          >
            บันทึกการเปลี่ยนแปลง
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;