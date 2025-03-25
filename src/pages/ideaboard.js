import { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Button, TextField,
  Grid, Select, MenuItem, FormControl, InputLabel, Chip,
  Box, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, useTheme, useMediaQuery,
  Snackbar, Alert
} from '@mui/material';
import { collection, query, orderBy, addDoc, getDocs, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { containsInappropriateContent } from '../utils/contentFilter';
import { serverTimestamp, getDoc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Add these theme colors at the top of the file after imports
const THEME_COLORS = {
  primary: '#009688',
  secondary: '#4DB6AC',
  background: '#F5F7FA',
  cardBg: '#FFFFFF',
  text: '#2C3E50',
  accent: '#00796B'
};

// Update the CATEGORIES array with new colors
const CATEGORIES = [
  { id: 'project', label: 'โปรเจกต์', color: '#009688' },
  { id: 'study', label: 'การเรียน', color: '#4DB6AC' },
  { id: 'research', label: 'งานวิจัย', color: '#00796B' },
  { id: 'presentation', label: 'งานนำเสนอ', color: '#26A69A' },
  { id: 'thesis', label: 'วิทยานิพนธ์', color: '#00897B' },
  { id: 'group-work', label: 'งานกลุ่ม', color: '#80CBC4' }
];

function IdeaBoard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Add these two new state variables
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  // Add missing handleSnackbar function
  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Add missing handleAddTag function
  const handleAddTag = () => {
    if (currentTag.trim() && !newIdea.tags.includes(currentTag.trim())) {
      setNewIdea({
        ...newIdea,
        tags: [...newIdea.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  // Add missing handleRemoveTag function
  const handleRemoveTag = (tagToRemove) => {
    setNewIdea({
      ...newIdea,
      tags: newIdea.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Add missing handleIdeaClick function
  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
    setOpenDialog(true);
  };

  // Add missing handleEdit function
  const handleEdit = (idea) => {
    setIsEditing(true);
    setEditingIdea(idea);
    setNewIdea({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      tags: idea.tags || []
    });
    setOpenDialog(false);
  };

  // Replace the useEffect that loads ideas with a real-time listener
  useEffect(() => {
    let unsubscribe;
    
    const setupRealTimeListener = () => {
      setLoading(true);
      let q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
      
      if (selectedCategory !== 'all') {
        q = query(
          collection(db, 'ideas'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc')
        );
      }

      unsubscribe = onSnapshot(q, (snapshot) => {
        const ideasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIdeas(ideasData);
        setLoading(false);
      }, (error) => {
        console.error('Error in real-time listener:', error);
        setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการโหลดไอเดีย', severity: 'error' });
        setLoading(false);
      });
    };

    setupRealTimeListener();
    
    // Clean up listener when component unmounts or when selectedCategory changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedCategory]);

  // Remove the loadIdeas function since we're using real-time updates
  // and update all references to it

  // Update handleDelete to not call loadIdeas
  const handleDelete = async (ideaId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบไอเดียนี้?')) {
      try {
        await deleteDoc(doc(db, 'ideas', ideaId));
        handleSnackbar('ลบไอเดียสำเร็จ');
        setOpenDialog(false);
        // No need to call loadIdeas() as the listener will update automatically
      } catch (error) {
        handleSnackbar('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
      }
    }
  };

  // Update handleUpdate to not call loadIdeas
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!newIdea.category) {
      handleSnackbar('กรุณาเลือกหมวดหมู่', 'error');
      return;
    }
    
    if (containsInappropriateContent(newIdea.title) || 
        containsInappropriateContent(newIdea.description)) {
      handleSnackbar('กรุณาใช้ภาษาที่สุภาพ', 'error');
      return;
    }

    try {
      await updateDoc(doc(db, 'ideas', editingIdea.id), {
        ...newIdea,
        updatedAt: new Date()
      });
      handleSnackbar('อัพเดทไอเดียสำเร็จ');
      setIsEditing(false);
      setEditingIdea(null);
      setNewIdea({ title: '', description: '', category: '', tags: [] });
      // No need to call loadIdeas() as the listener will update automatically
    } catch (error) {
      handleSnackbar('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
  };

  // Update handleSubmit to not call loadIdeas
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      handleSnackbar('กรุณาเข้าสู่ระบบก่อน', 'error');
      return;
    }

    if (!newIdea.category) {
      handleSnackbar('กรุณาเลือกหมวดหมู่', 'error');
      return;
    }

    if (containsInappropriateContent(newIdea.title) || 
        containsInappropriateContent(newIdea.description)) {
      handleSnackbar('กรุณาใช้ภาษาที่สุภาพ', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'ideas'), {
        ...newIdea,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0], // Add username
        userPhoto: auth.currentUser.photoURL,
        createdAt: new Date(),
        likes: 0,
        comments: []
      });
      setNewIdea({ title: '', description: '', category: '', tags: [] });
      handleSnackbar('แชร์ไอเดียสำเร็จ');
      // No need to call loadIdeas() as the listener will update automatically
    } catch (error) {
      handleSnackbar('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
  };

  // Update handleLike to not call loadIdeas
  const handleLike = async (ideaId, e) => {
    if (e) e.stopPropagation();
    if (!auth.currentUser) {
      handleSnackbar('กรุณาเข้าสู่ระบบก่อน', 'error');
      return;
    }

    setLoadingLike(true);
    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);
      const ideaData = ideaDoc.data();
      const likedBy = ideaData.likedBy || [];
      const hasLiked = likedBy.includes(auth.currentUser.uid);

      await updateDoc(ideaRef, {
        likes: hasLiked ? ideaData.likes - 1 : ideaData.likes + 1,
        likedBy: hasLiked
          ? likedBy.filter((uid) => uid !== auth.currentUser.uid)
          : [...likedBy, auth.currentUser.uid],
      });

      if (selectedIdea?.id === ideaId) {
        setSelectedIdea({
          ...selectedIdea,
          likes: hasLiked ? ideaData.likes - 1 : ideaData.likes + 1,
          likedBy: hasLiked
            ? likedBy.filter((uid) => uid !== auth.currentUser.uid)
            : [...likedBy, auth.currentUser.uid],
        });
      }
      // No need to call loadIdeas() as the listener will update automatically
    } catch (error) {
      handleSnackbar('เกิดข้อผิดพลาดในการกดถูกใจ', 'error');
    } finally {
      setLoadingLike(false);
    }
  };

  // Update handleAddComment to not call loadIdeas
  const handleAddComment = async (ideaId) => {
    if (!auth.currentUser) {
      handleSnackbar('กรุณาเข้าสู่ระบบก่อน', 'error');
      return;
    }

    if (!comment.trim()) {
      handleSnackbar('กรุณากรอกความคิดเห็น', 'error');
      return;
    }

    setLoadingComment(true);
    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);
      const ideaData = ideaDoc.data();
      
      if (!ideaDoc.exists()) {
        throw new Error('ไม่พบไอเดียที่ต้องการคอมเมนต์');
      }

      const currentData = ideaDoc.data();
      const currentComments = currentData.comments || [];

      const newComment = {
        id: uuidv4(),
        text: comment.trim(),
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        userPhoto: auth.currentUser.photoURL || '',
        createdAt: serverTimestamp() // Change this line to use Firestore serverTimestamp
      };

      await updateDoc(ideaRef, {
        comments: [...currentComments, newComment]
      });

      setComment('');
      setSelectedIdea(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));

      handleSnackbar('เพิ่มความคิดเห็นสำเร็จ');
      // No need to call loadIdeas() as the listener will update automatically
    } catch (error) {
      console.error('Comment error:', error);
      handleSnackbar(error.message || 'เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น', 'error');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteComment = async (ideaId, commentId) => {
    setLoadingComment(true);
    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);
      const ideaData = ideaDoc.data();

      await updateDoc(ideaRef, {
        comments: ideaData.comments.filter((c) => c.id !== commentId),
      });

      setSelectedIdea({
        ...selectedIdea,
        comments: ideaData.comments.filter((c) => c.id !== commentId),
      });
      // No need to call loadIdeas() as the listener will update automatically
      handleSnackbar('ลบความคิดเห็นสำเร็จ');
    } catch (error) {
      handleSnackbar('เกิดข้อผิดพลาดในการลบความคิดเห็น', 'error');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleEditComment = async (ideaId, commentId, newText) => {
    if (!newText.trim()) {
      setEditingComment(null);
      return;
    }

    setLoadingComment(true);
    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);
      const ideaData = ideaDoc.data();

      const updatedComments = ideaData.comments.map((c) =>
        c.id === commentId ? { ...c, text: newText } : c
      );

      await updateDoc(ideaRef, {
        comments: updatedComments,
      });

      setSelectedIdea({
        ...selectedIdea,
        comments: updatedComments,
      });
      // No need to call loadIdeas() as the listener will update automatically
      setEditingComment(null);
      handleSnackbar('แก้ไขความคิดเห็นสำเร็จ');
    } catch (error) {
      handleSnackbar('เกิดข้อผิดพลาดในการแก้ไขความคิดเห็น', 'error');
    } finally {
      setLoadingComment(false);
    }
  };

  // Add near the top of the component
  const handleProfileClick = async (userId, userEmail, userPhoto, e) => {
    if (e) e.stopPropagation();
    setSelectedUser({ id: userId, email: userEmail, photo: userPhoto });
    setOpenProfileDialog(true);
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 4 : 4,  // Increased top padding for mobile
        px: isMobile ? 1 : 2,
        bgcolor: '#FFFFFF',
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #f6f8fb 0%, #e9edf5 100%)',
        mt: isMobile ? 7 : 0,  // Add margin-top for mobile
        mb: isMobile ? 8 : 0   // Add margin-bottom for mobile
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{
          color: '#2C3E50',
          fontWeight: 'bold',
          mb: isMobile ? 2 : 3,
          textAlign: 'center',
          fontSize: isMobile ? '1.5rem' : '2rem'
        }}
      >
        แชร์ไอเดียของคุณ
      </Typography>

      <Card 
        sx={{ 
          mb: isMobile ? 2 : 4, 
          borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <form onSubmit={isEditing ? handleUpdate : handleSubmit}>
            <TextField
              fullWidth
              label="หัวข้อไอเดีย"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              sx={{ mb: isMobile ? 1.5 : 2 }}
              size={isMobile ? "small" : "medium"}
            />

            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                value={newIdea.category}
                label="หมวดหมู่"
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                error={!newIdea.category && newIdea.title.length > 0}
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
              type={isEditing ? "button" : "submit"}
              onClick={isEditing ? handleUpdate : undefined}
              fullWidth={isMobile}
              sx={{
                bgcolor: isEditing ? '#009688' : '#009688',
                '&:hover': { bgcolor: isEditing ? '#00796B' : '#00796B' },
                borderRadius: '20px',
                py: 1.5,
              }}
            >
              {isEditing ? 'อัพเดทไอเดีย' : 'แชร์ไอเดีย'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                }}
                onClick={() => handleIdeaClick(idea)}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      cursor: 'pointer' 
                    }}
                    onClick={(e) => handleProfileClick(idea.userId, idea.userEmail, idea.userPhoto, e)}
                  >
                    <Avatar src={idea.userPhoto} sx={{ 
                      mr: 1,
                      width: 40,
                      height: 40,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 500,
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {idea.userName || idea.userEmail.split('@')[0]}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>{idea.title}</Typography>
                  <Chip
                    label={CATEGORIES.find((cat) => cat.id === idea.category)?.label}
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

                <Box
                  sx={{
                    mt: 'auto',
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(idea.id, e);
                    }}
                    disabled={loadingLike}
                    color={idea.likedBy?.includes(auth.currentUser?.uid) ? "primary" : "default"}
                    sx={{ 
                      '&.Mui-disabled': { opacity: 0.5 },
                      '&.MuiIconButton-colorPrimary': { 
                        color: '#E91E63',  // Change to pink color for liked state
                        '& .MuiSvgIcon-root': { 
                          color: '#E91E63',
                          fill: '#E91E63' 
                        }
                      }
                    }}
                  >
                    {loadingLike ? (
                      <CircularProgress size={16} />
                    ) : (
                      <>
                        <ThumbUpIcon />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {idea.likes || 0}
                        </Typography>
                      </>
                    )}
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIdeaClick(idea);
                    }}
                  >
                    <CommentIcon />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {idea.comments?.length || 0}
                    </Typography>
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(`${window.location.origin}/idea/${idea.id}`);
                      handleSnackbar('คัดลอกลิงก์สำเร็จ', 'success');
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
              <Typography paragraph>{selectedIdea?.description}</Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedIdea?.tags?.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>

              <Box sx={{ mb: 2 }}>
                <IconButton
                  onClick={() => handleLike(selectedIdea.id)}
                  color={selectedIdea?.likedBy?.includes(auth.currentUser?.uid) ? "primary" : "default"}
                  disabled={loadingLike}
                  sx={{ 
                    '&.MuiIconButton-colorPrimary': { 
                      color: '#E91E63',
                      '& .MuiSvgIcon-root': { 
                        color: '#E91E63',
                        fill: '#E91E63' 
                      }
                    }
                  }}
                >
                  {loadingLike ? (
                    <CircularProgress size={16} />
                  ) : (
                    <>
                      <ThumbUpIcon />
                      <Typography sx={{ 
                        ml: 1,
                        color: selectedIdea?.likedBy?.includes(auth.currentUser?.uid) ? '#E91E63' : 'inherit'
                      }}
                      >
                        {selectedIdea?.likes || 0}
                      </Typography>
                    </>
                  )}
                </IconButton>
              </Box>

              <Typography variant="h6" gutterBottom>
                ความคิดเห็น
              </Typography>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="เพิ่มความคิดเห็น..."
                  disabled={loadingComment}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => handleAddComment(selectedIdea.id)}
                        disabled={loadingComment || !comment.trim()}
                      >
                        {loadingComment ? <CircularProgress size={16} /> : 'ส่ง'}
                      </Button>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && comment.trim()) {
                      handleAddComment(selectedIdea.id);
                    }
                  }}
                />
              </Box>

              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {selectedIdea?.comments?.length > 0 ? (
                  selectedIdea.comments.map((comment) => (
                    <Box
                      key={comment.id}
                      sx={{
                        mb: 2,
                        p: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar
                          src={comment.userPhoto}
                          alt={comment.userEmail}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {comment.userEmail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {comment.createdAt?.seconds 
                            ? new Date(comment.createdAt.seconds * 1000).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'ไม่ระบุวันที่'}
                        </Typography>
                      </Box>

                      {editingComment === comment.id ? (
                        <TextField
                          fullWidth
                          size="small"
                          defaultValue={comment.text}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEditComment(selectedIdea.id, comment.id, e.target.value);
                            }
                          }}
                          onBlur={(e) => handleEditComment(selectedIdea.id, comment.id, e.target.value)}
                        />
                      ) : (
                        <Typography variant="body2">{comment.text}</Typography>
                      )}

                      {comment.userId === auth.currentUser?.uid && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => setEditingComment(comment.id)}
                            disabled={loadingComment}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบความคิดเห็นนี้?')) {
                                handleDeleteComment(selectedIdea.id, comment.id);
                              }
                            }}
                            disabled={loadingComment}
                          >
                            {loadingComment ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    ยังไม่มีความคิดเห็น
                  </Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions>
              {selectedIdea?.userId === auth.currentUser?.uid && (
                <>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(selectedIdea)}
                    color="primary"
                    sx={{ color: '#009688' }}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(selectedIdea.id)}
                    color="error"
                  >
                    ลบ
                  </Button>
                </>
              )}
              <Button onClick={() => setOpenDialog(false)}>ปิด</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={openProfileDialog}
        onClose={() => setOpenProfileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedUser.photo}
                  sx={{ width: 64, height: 64 }}
                />
                <Box>
                  <Typography variant="h6">{selectedUser.email}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    โปรไฟล์ผู้ใช้
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ py: 2 }}>
                {/* Add user stats section */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    สถิติการแชร์ไอเดีย
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="h6" color="primary">
                        {ideas.filter(idea => idea.userId === selectedUser.id).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ไอเดียทั้งหมด
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h6" color="primary">
                        {ideas
                          .filter(idea => idea.userId === selectedUser.id)
                          .reduce((total, idea) => total + (idea.likes || 0), 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ถูกใจทั้งหมด
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h6" color="primary">
                        {ideas
                          .filter(idea => idea.userId === selectedUser.id)
                          .reduce((total, idea) => total + (idea.comments?.length || 0), 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ความคิดเห็น
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Add favorite tags section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    แท็กที่ใช้บ่อย
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from(
                      new Set(
                        ideas
                          .filter(idea => idea.userId === selectedUser.id)
                          .flatMap(idea => idea.tags || [])
                      )
                    ).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.main' }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom>
                  ไอเดียล่าสุด
                </Typography>
                <Grid container spacing={2}>
                  {ideas
                    .filter(idea => idea.userId === selectedUser.id)
                    .map(idea => (
                      <Grid item xs={12} key={idea.id}>
                        <Card 
                          sx={{ 
                            p: 2,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
                          }}
                          onClick={() => {
                            handleIdeaClick(idea);
                            setOpenProfileDialog(false);
                          }}
                        >
                          <Typography variant="subtitle1" gutterBottom>
                            {idea.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {idea.description.substring(0, 100)}...
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <ThumbUpIcon fontSize="small" color="action" />
                            <Typography variant="caption">{idea.likes || 0}</Typography>
                            <CommentIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                            <Typography variant="caption">{idea.comments?.length || 0}</Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenProfileDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
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
          sx={{ 
            width: '100%',
            '&.MuiAlert-standardSuccess': { bgcolor: 'rgba(0, 150, 136, 0.1)', color: '#009688' },
            '& .MuiAlert-icon': { color: '#009688' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default IdeaBoard;
