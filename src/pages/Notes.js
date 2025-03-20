import { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, TextField,
  Button, Box, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, CircularProgress, useTheme, useMediaQuery,
  Snackbar, Alert, Fade, Tooltip
} from '@mui/material';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

function Notes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [],
    currentTag: ''
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notes:', error);
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newNote.currentTag && !newNote.tags.includes(newNote.currentTag)) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, newNote.currentTag],
        currentTag: ''
      });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      handleSnackbar('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    try {
      if (editingNote) {
        await deleteDoc(doc(db, 'notes', editingNote.id));
      }

      await addDoc(collection(db, 'notes'), {
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'ผู้ใช้ไม่ระบุชื่อ',
        createdAt: new Date()
      });

      handleSnackbar(editingNote ? 'แก้ไขโน้ตสำเร็จ' : 'สร้างโน้ตสำเร็จ');
      setNewNote({ title: '', content: '', tags: [], currentTag: '' });
      setEditingNote(null);
      setOpenDialog(false);
      loadNotes();
    } catch (error) {
      handleSnackbar('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      currentTag: ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
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
          <NoteAddIcon sx={{ mr: 1, fontSize: isMobile ? 24 : 32 }} />
          โน้ตของฉัน
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingNote(null);
            setNewNote({ title: '', content: '', tags: [], currentTag: '' });
            setOpenDialog(true);
          }}
          sx={{
            bgcolor: '#96CEB4',
            '&:hover': { bgcolor: '#7AB39C' },
            width: isMobile ? '100%' : 'auto',
            borderRadius: '20px',
            py: 1.5
          }}
        >
          สร้างโน้ตใหม่
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={isMobile ? 2 : 3}>
          {notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Fade in timeout={500}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    },
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 2,
                      alignItems: 'flex-start'
                    }}>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontSize: isMobile ? '1.1rem' : '1.25rem',
                          wordBreak: 'break-word',
                          pr: 1
                        }}
                      >
                        {note.title}
                      </Typography>
                      <Box>
                        <Tooltip title="แก้ไข">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(note)}
                            sx={{ 
                              color: '#96CEB4',
                              '&:hover': { bgcolor: 'rgba(150, 206, 180, 0.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ลบ">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(note.id)}
                            sx={{ 
                              color: '#FF6B6B',
                              '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        minHeight: '60px',
                        maxHeight: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {note.content}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {note.tags?.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ bgcolor: '#96CEB4', color: 'white' }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                      โดย {note.userName}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
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
        <DialogTitle>
          {editingNote ? 'แก้ไขโน้ต' : 'สร้างโน้ตใหม่'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="หัวข้อ"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              sx={{ mb: 2, mt: 2 }}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="เนื้อหา"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            <Box sx={{ mb: 2 }}>
              <TextField
                label="แท็ก"
                value={newNote.currentTag}
                onChange={(e) => setNewNote({ ...newNote, currentTag: e.target.value })}
                size="small"
              />
              <Button onClick={handleAddTag} sx={{ ml: 1 }}>
                เพิ่มแท็ก
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {newNote.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
              <Button 
                type="submit"
                variant="contained"
                sx={{ 
                  bgcolor: '#96CEB4',
                  '&:hover': { bgcolor: '#7AB39C' }
                }}
              >
                {editingNote ? 'บันทึกการแก้ไข' : 'สร้างโน้ต'}
              </Button>
            </DialogActions>
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

export default Notes;