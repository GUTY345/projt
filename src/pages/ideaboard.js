import { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Button, TextField,
  Grid, Select, MenuItem, FormControl, InputLabel, Chip,
  Box, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, useTheme, useMediaQuery,
  Tooltip, Snackbar, Alert
} from '@mui/material';
import { collection, query, orderBy, addDoc, getDocs, where } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';

const CATEGORIES = [
  { id: 'project', label: 'โปรเจกต์', color: '#FF6B6B' },
  { id: 'study', label: 'การเรียน', color: '#4ECDC4' },
  { id: 'research', label: 'งานวิจัย', color: '#45B7D1' },
  { id: 'presentation', label: 'งานนำเสนอ', color: '#96CEB4' },
  { id: 'thesis', label: 'วิทยานิพนธ์', color: '#FFEEAD' },
  { id: 'group-work', label: 'งานกลุ่ม', color: '#D4A5A5' }
];

function IdeaBoard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: '',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadIdeas();
  }, [selectedCategory]);

  const loadIdeas = async () => {
    try {
      let q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
      
      if (selectedCategory !== 'all') {
        q = query(
          collection(db, 'ideas'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const ideasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIdeas(ideasData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading ideas:', error);
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag && !newIdea.tags.includes(currentTag)) {
      setNewIdea({
        ...newIdea,
        tags: [...newIdea.tags, currentTag]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewIdea({
      ...newIdea,
      tags: newIdea.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Add snackbar handler
  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Update handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      handleSnackbar('กรุณาเข้าสู่ระบบก่อน', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'ideas'), {
        ...newIdea,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userPhoto: auth.currentUser.photoURL,
        createdAt: new Date(),
        likes: 0,
        comments: []
      });
      setNewIdea({ title: '', description: '', category: '', tags: [] });
      handleSnackbar('แชร์ไอเดียสำเร็จ');
      loadIdeas();
    } catch (error) {
      handleSnackbar('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
  };

  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ 
      py: isMobile ? 2 : 4,
      px: isMobile ? 1 : 2
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        sx={{ 
          color: '#2C3E50', 
          fontWeight: 'bold',
          mb: isMobile ? 2 : 3
        }}
      >
        แชร์ไอเดียของคุณ
      </Typography>

      <Card sx={{ 
        mb: isMobile ? 2 : 4, 
        borderRadius: 2, 
        boxShadow: 3 
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Form fields with mobile responsive spacing */}
            <TextField
              fullWidth
              label="หัวข้อไอเดีย"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              sx={{ mb: isMobile ? 1.5 : 2 }}
              size={isMobile ? "small" : "medium"}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                value={newIdea.category}
                label="หมวดหมู่"
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="รายละเอียด"
              value={newIdea.description}
              onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <TextField
                label="แท็ก"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                size="small"
              />
              <Button onClick={handleAddTag} sx={{ ml: 1 }}>เพิ่มแท็ก</Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              {newIdea.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            <Button 
              variant="contained" 
              type="submit"
              fullWidth={isMobile}
              sx={{ 
                bgcolor: '#FF6B6B',
                '&:hover': { bgcolor: '#FF5252' },
                borderRadius: '20px',
                py: 1.5
              }}
            >
              แชร์ไอเดีย
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ideas Grid with mobile responsive layout */}
      <Grid container spacing={isMobile ? 1.5 : 3}>
        {ideas.map((idea) => (
          <Grid item xs={12} sm={6} md={4} key={idea.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                borderRadius: isMobile ? 1 : 2
              }}
              onClick={() => handleIdeaClick(idea)}
            >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={idea.userPhoto} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {idea.userEmail}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>{idea.title}</Typography>
                  <Chip 
                    label={CATEGORIES.find(cat => cat.id === idea.category)?.label}
                    sx={{ mb: 1 }}
                  />
                  <Typography color="text.secondary" paragraph>
                    {idea.description}
                  </Typography>
                  <Box>
                    {idea.tags?.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <Box sx={{ 
                  mt: 'auto', 
                  p: 2, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-around'
                }}>
                  <IconButton size="small">
                    <ThumbUpIcon /> {idea.likes}
                  </IconButton>
                  <IconButton size="small">
                    <CommentIcon /> {idea.comments?.length || 0}
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

      {/* Mobile responsive dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedIdea && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={selectedIdea.userPhoto} sx={{ mr: 2 }} />
                <Typography variant="h6">{selectedIdea.title}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography paragraph>{selectedIdea.description}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedIdea.tags?.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>ปิด</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
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

export default IdeaBoard;