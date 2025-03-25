import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Box, Avatar, Typography, Button, TextField,
  Chip, Switch, FormControlLabel, Paper, Grid, CircularProgress,
  IconButton, useTheme, useMediaQuery, Snackbar, Alert, Skeleton
} from '@mui/material';
import { auth, db, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth'; // เพิ่ม import นี้
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const INTEREST_TAGS = [
  'การเรียน', 'โปรเจกต์', 'วิจัย', 'งานกลุ่ม', 'การนำเสนอ',
  'เทคโนโลยี', 'วิทยาศาสตร์', 'ศิลปะ', 'ดนตรี', 'กีฬา',
  'ภาษา', 'การตลาด', 'ธุรกิจ', 'การเงิน', 'การออกแบบ'
];

function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userId } = useParams();
  
  // Add all required states
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profile, setProfile] = useState({
    displayName: '',
    interests: [],
    photoURL: '',
    description: ''
  });
  const [stats, setStats] = useState({ ideas: 0, moodboards: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const targetUserId = userId || auth.currentUser?.uid;
        setIsOwnProfile(!userId || userId === auth.currentUser?.uid);
        
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData(userData);
          setProfile(userData);
          setDescription(userData.description || '');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setSnackbar({ 
          open: true, 
          message: 'ไม่สามารถโหลดข้อมูลได้', 
          severity: 'error' 
        });
      }
    };

    loadProfileData();
    loadStats();
  }, [userId]);

  const loadProfile = async () => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      setProfile({ ...userDoc.data() });
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      // Query ideas collection for user's ideas
      const ideasQuery = query(
        collection(db, 'ideas'),
        where('userId', '==', auth.currentUser.uid)
      );
      const ideasSnapshot = await getDocs(ideasQuery);
      
      // Update stats with actual count
      setStats({
        ...stats,
        ideas: ideasSnapshot.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handlePhotoUpload = async (e) => {
    // ปิดฟีเจอร์การเปลี่ยนรูปโปรไฟล์ชั่วคราวจนกว่าจะแก้ไขปัญหาเสร็จ
    // ปิดฟีเจอร์ชั่วคราว
    setSnackbar({ 
      open: true, 
      message: 'ฟีเจอร์นี้ถูกปิดชั่วคราวเนื่องจากอยู่ระหว่างการปรับปรุง', 
      severity: 'info' 
    });
    return;
    
    // โค้ดเดิมที่ถูกปิดไว้ชั่วคราว
    /*
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
    */
  };

  // Update the toggleInterest function to handle undefined interests
  const toggleInterest = (tag) => {
    const currentInterests = profile?.interests || [];
    const newInterests = currentInterests.includes(tag)
      ? currentInterests.filter(t => t !== tag)
      : [...currentInterests, tag];
    setProfile(prev => ({ ...prev, interests: newInterests }));
  };

  // Add new state for name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = {
        ...profile,
        description: description,
        displayName: newDisplayName || profile.displayName,
        interests: profile.interests
      };
      
      // Update profile in users collection
      await setDoc(doc(db, 'users', auth.currentUser.uid), updatedProfile);
      
      // Update displayName in Firebase Authentication
      await updateProfile(auth.currentUser, {
        displayName: updatedProfile.displayName
      });
      
      // Update all references in ideas collection
      const ideasQuery = query(
        collection(db, 'ideas'),
        where('userId', '==', auth.currentUser.uid)
      );
      const ideasSnapshot = await getDocs(ideasQuery);
      
      const updatePromises = ideasSnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          userName: updatedProfile.displayName,
          // อัพเดททุกฟิลด์ที่อาจมีชื่อผู้ใช้
          userDisplayName: updatedProfile.displayName,
          author: updatedProfile.displayName
        })
      );
      
      // Update all chat messages across all groups
      const chatGroupsQuery = query(collection(db, 'chatGroups'));
      const chatGroupsSnapshot = await getDocs(chatGroupsQuery);
      
      const chatUpdatePromises = [];
      
      // ดึงข้อมูลทุกกลุ่มแชทและอัพเดทข้อความทั้งหมดที่ผู้ใช้เป็นคนส่ง
      for (const groupDoc of chatGroupsSnapshot.docs) {
        // อัพเดทข้อมูลสมาชิกในกลุ่ม (ถ้ามี)
        if (groupDoc.data().members?.includes(auth.currentUser.uid)) {
          const memberData = groupDoc.data().memberData || {};
          if (memberData[auth.currentUser.uid]) {
            memberData[auth.currentUser.uid].displayName = updatedProfile.displayName;
            chatUpdatePromises.push(
              updateDoc(doc(db, 'chatGroups', groupDoc.id), { 
                memberData: memberData 
              })
            );
          }
        }
        
        // อัพเดทข้อความในกลุ่ม
        const messagesQuery = query(
          collection(db, `chatGroups/${groupDoc.id}/messages`),
          where('userId', '==', auth.currentUser.uid)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        messagesSnapshot.docs.forEach(messageDoc => {
          chatUpdatePromises.push(
            updateDoc(messageDoc.ref, {
              userName: updatedProfile.displayName
            })
          );
        });
      }
      
      // อัพเดทคอมเมนต์ในไอเดียทั้งหมด
      const allIdeasQuery = query(collection(db, 'ideas'));
      const allIdeasSnapshot = await getDocs(allIdeasQuery);
      
      const commentUpdatePromises = [];
      
      allIdeasSnapshot.docs.forEach(ideaDoc => {
        const ideaData = ideaDoc.data();
        if (ideaData.comments && ideaData.comments.length > 0) {
          const updatedComments = ideaData.comments.map(comment => {
            if (comment.userId === auth.currentUser.uid) {
              return {
                ...comment,
                userName: updatedProfile.displayName
              };
            }
            return comment;
          });
          
          if (JSON.stringify(updatedComments) !== JSON.stringify(ideaData.comments)) {
            commentUpdatePromises.push(
              updateDoc(doc(db, 'ideas', ideaDoc.id), {
                comments: updatedComments
              })
            );
          }
        }
      });
      
      // รวม promises ทั้งหมดและรอให้ทำงานเสร็จ
      await Promise.all([...updatePromises, ...chatUpdatePromises, ...commentUpdatePromises]);
      
      // รีโหลดข้อมูลผู้ใช้จาก Firebase เพื่อให้แน่ใจว่าข้อมูลอัพเดทแล้ว
      auth.currentUser.reload();
      
      setProfileData(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setIsEditingName(false);
      setSnackbar({ 
        open: true, 
        message: 'บันทึกข้อมูลสำเร็จ', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({ 
        open: true, 
        message: 'เกิดข้อผิดพลาด กรุณาลองใหม่', 
        severity: 'error' 
      });
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
    <Container maxWidth="lg" sx={{ 
      py: 2,
      px: isMobile ? 1 : 3,
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(145deg, #1a1a1a, #2d2d2d)'
        : 'linear-gradient(145deg, #f5f5f5, #ffffff)'
    }}>
      <Paper elevation={3} sx={{ 
        p: isMobile ? 2 : 3, 
        borderRadius: '20px',
        position: 'relative',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(145deg, #2d2d2d, #353535)'
          : 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ textAlign: 'center', position: 'relative', mb: 3 }}>
          <Box sx={{ 
            position: 'relative', 
            display: 'inline-block',
            borderRadius: '50%',
            p: 0.5,
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            mb: 2
          }}>
            <Avatar
              src={profileData?.photoURL}
              sx={{ 
                width: 120, 
                height: 120, 
                border: '4px solid',
                borderColor: theme.palette.background.paper,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            />
            {/* ปิดปุ่มอัพโหลดรูปชั่วคราว
            {isOwnProfile && !uploading && (
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  bgcolor: 'primary.main',
                  width: 32,
                  height: 32,
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            */}
          </Box>
          
          {/* ลบ input file ที่ซ่อนอยู่ */}
          {/* <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          /> */}
          
          {/* Replace the Typography with editable name field */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            {isEditingName ? (
              <TextField
                fullWidth
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="ใส่ชื่อของคุณ"
                sx={{ 
                  maxWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => {
                      setIsEditingName(false);
                      handleSaveProfile();
                    }}>
                      <EditIcon />
                    </IconButton>
                  ),
                }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {profileData?.displayName || 'ไม่ระบุชื่อ'}
                </Typography>
                {isOwnProfile && (
                  <IconButton 
                    onClick={() => {
                      setIsEditingName(true);
                      setNewDisplayName(profileData?.displayName || '');
                    }}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder="เพิ่มคำอธิบายเกี่ยวกับตัวคุณ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />

          <Grid container spacing={2} sx={{ mt: 3, mb: 4 }}>
            <Grid item xs={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {stats.ideas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ไอเดีย
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {profileData?.interests?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ความสนใจ
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                mb: 2,
                fontSize: '1.1rem'
              }}
            >
              ความสนใจ
            </Typography>
            // Update the Chip component rendering
            <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            justifyContent: 'center' 
            }}>
            {INTEREST_TAGS.map((tag) => (
            <Chip
            key={tag}
            label={tag}
            onClick={isOwnProfile ? () => toggleInterest(tag) : undefined}
            color={(profile?.interests || []).includes(tag) ? "primary" : "default"}
            variant={(profile?.interests || []).includes(tag) ? "filled" : "outlined"}
            sx={{ 
            m: 0.5,
            borderRadius: '12px',
            cursor: isOwnProfile ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            '&:hover': isOwnProfile ? {
            transform: 'translateY(-2px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            } : {}
            }}
            />
            ))}
            </Box>
          </Box>

          {isOwnProfile && (
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              fullWidth
              sx={{
                mt: 3,
                borderRadius: '12px',
                py: 1.5,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;