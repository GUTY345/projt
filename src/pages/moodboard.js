import { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  Button, Box, Dialog, DialogTitle, DialogContent, TextField,
  IconButton, CircularProgress, useTheme, useMediaQuery,
  Snackbar, Alert, DialogActions, ImageList, ImageListItem
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

  // Remove the first simple handleFileChange and keep only this enhanced version
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        handleSnackbar('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
        return;
      }
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        handleSnackbar('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
        return;
      }
      setNewMood({
        ...newMood,
        file: file
      });
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMood.file || !newMood.title) {
      handleSnackbar('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', newMood.file);
      formData.append('title', newMood.title);
      formData.append('description', newMood.description || '');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'การอัพโหลดล้มเหลว');
      }

      setNewMood({ title: '', description: '', file: null });
      setOpenDialog(false);
      handleSnackbar('อัพโหลดรูปภาพสำเร็จ');
      await loadImages();
    } catch (error) {
      console.error('Upload error:', error);
      handleSnackbar(error.message || 'เกิดข้อผิดพลาดในการอัพโหลด', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      py: isMobile ? 2 : 4,
      px: isMobile ? 1 : 2
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: isMobile ? 2 : 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            color: '#2C3E50', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ColorLensIcon sx={{ mr: 1, fontSize: isMobile ? 24 : 32 }} />
          มู้ดบอร์ด
        </Typography>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            bgcolor: '#4ECDC4',
            '&:hover': { bgcolor: '#45B7D1' },
            width: isMobile ? '100%' : 'auto',
            borderRadius: '20px',
            py: 1.5
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
        <ImageList 
          variant="masonry" 
          cols={isMobile ? 1 : 3} 
          gap={isMobile ? 8 : 16}
        >
          {images.map((image) => (
            <ImageListItem key={image.id}>
              <Card 
                sx={{ 
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardMedia
                  component="img"
                  image={image.imageUrl}
                  alt={image.title}
                  sx={{ 
                    objectFit: 'cover',
                    aspectRatio: '16/9'
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {image.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {image.description}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    display="block" 
                    sx={{ mt: 1, color: 'text.secondary' }}
                  >
                    โดย {image.userName}
                  </Typography>
                </CardContent>
              </Card>
            </ImageListItem>
          ))}
        </ImageList>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => !uploading && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
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
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#4ECDC4',
                  bgcolor: 'rgba(78, 205, 196, 0.04)'
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="image-upload"
                disabled={uploading}
              />
              <label htmlFor="image-upload" style={{ width: '100%', cursor: 'pointer' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#4ECDC4' }} />
                  <Typography>
                    {newMood.file ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}
                  </Typography>
                </Box>
              </label>
              {newMood.file && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {newMood.file.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.preventDefault();
                      setNewMood({ ...newMood, file: null });
                    }}
                    disabled={uploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => !uploading && setOpenDialog(false)}
                disabled={uploading}
                sx={{ 
                  color: '#4ECDC4',
                  borderColor: '#4ECDC4',
                  '&:hover': { 
                    borderColor: '#45B7D1',
                    bgcolor: 'rgba(78, 205, 196, 0.04)'
                  }
                }}
              >
                ยกเลิก
              </Button>
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
            </Box>
          </form>
        </DialogContent>
      </Dialog>

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

export default MoodBoard;