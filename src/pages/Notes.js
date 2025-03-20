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
import { blueGrey, teal } from '@mui/material/colors';

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
      py: isMobile ? 1 : 4,
      px: isMobile ? 1 : 2,
      bgcolor: blueGrey[50],
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: isMobile ? 2 : 4,
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography 
          variant="h5"
          sx={{ 
            color: blueGrey[800], 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <NoteAddIcon sx={{ mr: 1, fontSize: 28 }} />
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
            bgcolor: teal[400],
            '&:hover': { bgcolor: teal[500] },
            width: '100%',
            borderRadius: '12px',
            py: 1.5,
            boxShadow: 2
          }}
        >
          สร้างโน้ตใหม่
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: teal[400] }} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {notes.map((note) => (
            <Grid item xs={12} key={note.id}>
              <Fade in timeout={500}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: 'white'
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1.5,
                      alignItems: 'center'
                    }}>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: blueGrey[800]
                        }}
                      >
                        {note.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(note)}
                          sx={{ 
                            color: teal[400],
                            p: 1
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(note.id)}
                          sx={{ 
                            color: '#FF6B6B',
                            p: 1
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2,
                        color: blueGrey[600],
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {note.content}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {note.tags?.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ 
                            bgcolor: teal[50],
                            color: teal[700],
                            fontSize: '0.75rem'
                          }}
                        />
                      ))}
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 2,
                        display: 'block',
                        color: blueGrey[400]
                      }}
                    >
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
        fullScreen={true}
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ 
          bgcolor: teal[50],
          py: 2
        }}>
          {editingNote ? 'แก้ไขโน้ต' : 'สร้างโน้ตใหม่'}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
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
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Notes;