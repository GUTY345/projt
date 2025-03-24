import { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, TextField,
  Button, Box, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, CircularProgress, useTheme, useMediaQuery,
  Snackbar, Alert, Fade, Tooltip, InputAdornment, MenuItem, Select,
  FormControl, InputLabel, Tab, Tabs, Paper, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SearchIcon from '@mui/icons-material/Search';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import PaletteIcon from '@mui/icons-material/Palette';
import { blueGrey, teal, pink, purple, amber, lightBlue, deepOrange, green } from '@mui/material/colors';

// สีที่ใช้สำหรับโน้ต
const NOTE_COLORS = [
  { id: 'default', color: 'white', name: 'ค่าเริ่มต้น' },
  { id: 'blue', color: lightBlue[50], name: 'ฟ้า' },
  { id: 'green', color: green[50], name: 'เขียว' },
  { id: 'purple', color: purple[50], name: 'ม่วง' },
  { id: 'pink', color: pink[50], name: 'ชมพู' },
  { id: 'amber', color: amber[50], name: 'เหลือง' },
  { id: 'orange', color: deepOrange[50], name: 'ส้ม' },
];

// หมวดหมู่สำหรับโน้ต
const CATEGORIES = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'personal', name: 'ส่วนตัว' },
  { id: 'work', name: 'งาน' },
  { id: 'study', name: 'การเรียน' },
  { id: 'ideas', name: 'ไอเดีย' },
  { id: 'other', name: 'อื่นๆ' },
];

function Notes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [],
    currentTag: '',
    pinned: false,
    category: 'personal',
    color: 'default'
  });

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    // กรองโน้ตตามการค้นหาและหมวดหมู่
    let filtered = [...notes];
    
    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // กรองตามหมวดหมู่
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }
    
    // จัดเรียงโดยให้โน้ตที่ปักหมุดอยู่ด้านบน
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedCategory]);

  const loadNotes = async () => {
    try {
      if (!auth.currentUser) {
        console.error('No authenticated user');
        setLoading(false);
        return;
      }
      
      console.log('Loading notes for user:', auth.currentUser.uid);
      
      // ลบ orderBy ออกก่อนเพื่อหลีกเลี่ยงปัญหา index
      const q = query(
        collection(db, 'notes'), 
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot size:', querySnapshot.size);
      
      const notesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // แปลงวันที่ให้ถูกต้อง
        let createdAt = new Date();
        if (data.createdAt) {
          createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        }
        
        let updatedAt = new Date();
        if (data.updatedAt) {
          updatedAt = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt,
          updatedAt
        };
      });
      
      // เรียงลำดับข้อมูลหลังจากดึงข้อมูลมาแล้ว แทนการใช้ orderBy ใน query
      notesData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed notes data:', notesData);
      setNotes(notesData);
      setFilteredNotes(notesData);
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

  // เพิ่มฟังก์ชัน handleEdit ที่หายไป
  const handleEdit = (note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      currentTag: '',
      pinned: note.pinned || false,
      category: note.category || 'personal',
      color: note.color || 'default'
    });
    setOpenDialog(true);
  };

  // แทนที่ useEffect เดิมที่เรียก loadNotes
  useEffect(() => {
    // ตรวจสอบว่ามีผู้ใช้ที่ล็อกอินอยู่หรือไม่
    if (!auth.currentUser) {
      console.error('No authenticated user');
      setLoading(false);
      return;
    }
    
    console.log('Setting up real-time listener for notes');
    
    // สร้าง query สำหรับดึงข้อมูลโน้ตของผู้ใช้ปัจจุบัน
    const q = query(
      collection(db, 'notes'), 
      where('userId', '==', auth.currentUser.uid)
    );
    
    // สร้าง real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('Received real-time update, docs count:', querySnapshot.size);
      
      const notesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // แปลงวันที่ให้ถูกต้อง
        let createdAt = new Date();
        if (data.createdAt) {
          createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        }
        
        let updatedAt = new Date();
        if (data.updatedAt) {
          updatedAt = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt,
          updatedAt
        };
      });
      
      // เรียงลำดับข้อมูล
      notesData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed notes data:', notesData);
      setNotes(notesData);
      setLoading(false);
    }, (error) => {
      console.error('Error in real-time listener:', error);
      setLoading(false);
    });
    
    // ทำการ cleanup listener เมื่อ component unmount
    return () => {
      console.log('Cleaning up real-time listener');
      unsubscribe();
    };
  }, []);

  // แก้ไขฟังก์ชัน handleSubmit, handleDelete, และ handleTogglePin โดยลบการเรียก loadNotes()
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      handleSnackbar('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    try {
      if (!auth.currentUser) {
        handleSnackbar('กรุณาเข้าสู่ระบบก่อน', 'error');
        return;
      }
      
      console.log('Current user:', auth.currentUser.uid);
      
      const noteData = {
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags || [],
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'ผู้ใช้ไม่ระบุชื่อ',
        pinned: newNote.pinned || false,
        category: newNote.category || 'personal',
        color: newNote.color || 'default',
        updatedAt: new Date()
      };
      
      console.log('Saving note data:', noteData);

      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote.id), noteData);
        console.log('Updated note with ID:', editingNote.id);
      } else {
        noteData.createdAt = new Date();
        const docRef = await addDoc(collection(db, 'notes'), noteData);
        console.log('Added new note with ID:', docRef.id);
      }

      handleSnackbar(editingNote ? 'แก้ไขโน้ตสำเร็จ' : 'สร้างโน้ตสำเร็จ');
      setNewNote({ 
        title: '', 
        content: '', 
        tags: [], 
        currentTag: '',
        pinned: false,
        category: 'personal',
        color: 'default'
      });
      setEditingNote(null);
      setOpenDialog(false);
      
      // ไม่ต้องเรียก loadNotes() อีกต่อไป เพราะ real-time listener จะจัดการให้กับ
    } catch (error) {
      console.error('Error saving note:', error);
      handleSnackbar('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      // ไม่ต้องเรียก loadNotes() อีกต่อไป
      handleSnackbar('ลบโน้ตสำเร็จ');
    } catch (error) {
      console.error('Error deleting note:', error);
      handleSnackbar('เกิดข้อผิดพลาดในการลบโน้ต', 'error');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await updateDoc(doc(db, 'notes', note.id), {
        pinned: !note.pinned
      });
      // ไม่ต้องเรียก loadNotes() อีกต่อไป
      handleSnackbar(note.pinned ? 'ยกเลิกการปักหมุดสำเร็จ' : 'ปักหมุดโน้ตสำเร็จ');
    } catch (error) {
      console.error('Error toggling pin:', error);
      handleSnackbar('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
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
        mb: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2
      }}>
        <Typography 
          variant="h5"
          sx={{ 
            color: blueGrey[800], 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <NoteAddIcon sx={{ mr: 1, fontSize: 28 }} />
          โน้ตของฉัน
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingNote(null);
            setNewNote({ 
              title: '', 
              content: '', 
              tags: [], 
              currentTag: '',
              pinned: false,
              category: 'personal',
              color: 'default'
            });
            setOpenDialog(true);
          }}
          sx={{
            bgcolor: teal[400],
            '&:hover': { bgcolor: teal[500] },
            borderRadius: '12px',
            py: 1.5,
            px: 3,
            boxShadow: 2
          }}
        >
          สร้างโน้ตใหม่
        </Button>
      </Box>

      {/* ส่วนค้นหาและกรอง */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ค้นหาโน้ต..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                value={selectedCategory}
                label="หมวดหมู่"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode !== null) {
                  setViewMode(newMode);
                }
              }}
              size="small"
              sx={{ width: '100%', justifyContent: 'center' }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: teal[400] }} />
        </Box>
      ) : filteredNotes.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 4,
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: 1,
          my: 4
        }}>
          <Typography variant="h6" sx={{ color: blueGrey[600], mb: 2 }}>
            ไม่พบโน้ตที่ค้นหา
          </Typography>
          <Typography variant="body2" sx={{ color: blueGrey[400], textAlign: 'center' }}>
            ลองค้นหาด้วยคำอื่น หรือสร้างโน้ตใหม่
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredNotes.map((note) => {
            // หาสีของโน้ต
            const noteColor = NOTE_COLORS.find(c => c.id === note.color)?.color || 'white';
            
            return (
            <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={note.id}>
              <Fade in timeout={500}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: noteColor,
                    position: 'relative',
                    borderTop: note.pinned ? `3px solid ${teal[400]}` : 'none'
                  }}
                >
                  {/* ไอคอนปักหมุด */}
                  <IconButton 
                    size="small" 
                    onClick={() => handleTogglePin(note)}
                    sx={{ 
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: note.pinned ? teal[400] : blueGrey[300],
                      p: 0.5
                    }}
                  >
                    {note.pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                  </IconButton>
                  
                  <CardContent 
                    sx={{ 
                      p: 2.5,
                      '&:last-child': { pb: 2.5 },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleEdit(note)}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1.5,
                      alignItems: 'flex-start',
                      pr: 3 // ให้มีพื้นที่สำหรับปุ่มปักหมุด
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
                    </Box>
                    
                    {/* แสดงหมวดหมู่ */}
                    {note.category && (
                      <Chip
                        label={CATEGORIES.find(c => c.id === note.category)?.name || note.category}
                        size="small"
                        sx={{ 
                          mb: 1.5,
                          bgcolor: teal[100],
                          color: teal[800],
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                    
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
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: blueGrey[400]
                        }}
                      >
                        {note.updatedAt ? 
                          'แก้ไขล่าสุด: ' + new Date(note.updatedAt instanceof Date ? note.updatedAt : note.updatedAt.seconds * 1000).toLocaleDateString('th-TH') : 
                          'สร้างเมื่อ: ' + new Date(note.createdAt instanceof Date ? note.createdAt : note.createdAt.seconds * 1000).toLocaleDateString('th-TH')}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(note);
                          }}
                          sx={{ 
                            color: teal[400],
                            p: 0.5
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(note.id);
                          }}
                          sx={{ 
                            color: '#FF6B6B',
                            p: 0.5
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          )})}
        </Grid>
      )}

      {/* Dialog สำหรับสร้าง/แก้ไขโน้ต */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth={!isMobile}
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ 
          bgcolor: teal[50],
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            {editingNote ? 'แก้ไขโน้ต' : 'สร้างโน้ตใหม่'}
          </Typography>
          <IconButton
            onClick={() => setNewNote({...newNote, pinned: !newNote.pinned})}
            sx={{ color: newNote.pinned ? teal[500] : blueGrey[300] }}
          >
            {newNote.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="หัวข้อ"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select
                    value={newNote.category}
                    label="หมวดหมู่"
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="เนื้อหา"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <TextField
                    label="แท็ก"
                    value={newNote.currentTag}
                    onChange={(e) => setNewNote({ ...newNote, currentTag: e.target.value })}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddTag} 
                    variant="outlined"
                    sx={{ 
                      height: 40,
                      borderColor: teal[400],
                      color: teal[400],
                      '&:hover': {
                        borderColor: teal[500],
                        bgcolor: 'rgba(0, 150, 136, 0.08)'
                      }
                    }}
                  >
                    เพิ่มแท็ก
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {newNote.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{
                        bgcolor: teal[50],
                        color: teal[700],
                        '& .MuiChip-deleteIcon': {
                          color: teal[400],
                          '&:hover': {
                            color: teal[700]
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>สีโน้ต</InputLabel>
                  <Select
                    value={newNote.color}
                    label="สีโน้ต"
                    onChange={(e) => setNewNote({ ...newNote, color: e.target.value })}
                    startAdornment={
                      <InputAdornment position="start">
                        <PaletteIcon sx={{ color: teal[400] }} />
                      </InputAdornment>
                    }
                  >
                    {NOTE_COLORS.map((color) => (
                      <MenuItem key={color.id} value={color.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            bgcolor: color.color,
                            border: '1px solid #ddd'
                          }} />
                          {color.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <DialogActions sx={{ px: 0, mt: 2 }}>
              <Button 
                onClick={() => setOpenDialog(false)}
                sx={{ color: blueGrey[400] }}
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit"
                variant="contained"
                sx={{ 
                  bgcolor: teal[400],
                  '&:hover': { bgcolor: teal[500] }
                }}
              >
                {editingNote ? 'บันทึกการแก้ไข' : 'สร้างโน้ต'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Snackbar สำหรับแสดงข้อความแจ้งเตือน */}
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