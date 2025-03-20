import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  CircularProgress
} from '@mui/material';
import { storage, db, auth } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';

function MoodBoard() {
  const [images, setImages] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newMood, setNewMood] = useState({
    title: '',
    description: '',
    file: null
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const q = query(collection(db, 'moodboards'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setImages(imagesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading images:', error);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewMood({
        ...newMood,
        file: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMood.file || !newMood.title) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `moodboards/${Date.now()}_${newMood.file.name}`);
      await uploadBytes(storageRef, newMood.file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'moodboards'), {
        title: newMood.title,
        description: newMood.description,
        imageUrl,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'ผู้ใช้ไม่ระบุชื่อ',
        createdAt: new Date()
      });

      setNewMood({ title: '', description: '', file: null });
      setOpenDialog(false);
      loadImages();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
          <ColorLensIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          มู้ดบอร์ด
        </Typography>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            bgcolor: '#4ECDC4',
            '&:hover': { bgcolor: '#45B7D1' }
          }}
        >
          เพิ่มรูปภาพ
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={image.imageUrl}
                  alt={image.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {image.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {image.description}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    โดย {image.userName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => !uploading && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>เพิ่มรูปภาพใหม่</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="ชื่อรูปภาพ"
              value={newMood.title}
              onChange={(e) => setNewMood({ ...newMood, title: e.target.value })}
              sx={{ mb: 2, mt: 2 }}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="คำอธิบาย"
              value={newMood.description}
              onChange={(e) => setNewMood({ ...newMood, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                mb: 2
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  component="span"
                  startIcon={<AddPhotoAlternateIcon />}
                  disabled={uploading}
                >
                  เลือกรูปภาพ
                </Button>
              </label>
              {newMood.file && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    {newMood.file.name}
                    <IconButton 
                      size="small" 
                      onClick={() => setNewMood({ ...newMood, file: null })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Typography>
                </Box>
              )}
            </Box>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={!newMood.file || !newMood.title || uploading}
              sx={{ 
                bgcolor: '#4ECDC4',
                '&:hover': { bgcolor: '#45B7D1' }
              }}
            >
              {uploading ? <CircularProgress size={24} /> : 'อัพโหลด'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default MoodBoard;