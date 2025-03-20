import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

function Notes() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;

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

      setNewNote({ title: '', content: '', tags: [], currentTag: '' });
      setEditingNote(null);
      setOpenDialog(false);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
          <NoteAddIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
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
            '&:hover': { bgcolor: '#7AB39C' }
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
        <Grid container spacing={3}>
          {notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
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
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{note.title}</Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleEdit(note)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(note.id)}>
                        <DeleteIcon />
                      </IconButton>
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
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
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
    </Container>
  );
}

export default Notes;