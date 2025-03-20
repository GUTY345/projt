import { useState, useEffect, useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Container,
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { collection, query, orderBy, limit, addDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ChatGroupDialog from '../components/ChatGroupDialog';
import JoinGroupDialog from '../components/JoinGroupDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteDoc, doc } from 'firebase/firestore';
import LogoutIcon from '@mui/icons-material/Logout';
import { updateDoc, arrayRemove } from 'firebase/firestore';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add new state for groups
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  
  // Add groups listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'chatGroups'),
      (snapshot) => {
        const groupsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(group => !group.isPrivate || group.members.includes(auth.currentUser.uid));
        setGroups(groupsData);
        // Select first group by default if none selected
        if (!selectedGroup && groupsData.length > 0) {
          setSelectedGroup(groupsData[0]);
        }
      }
    );
  
    return () => unsubscribe();
  }, []);
  
  // Fix messages listener
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    
    if (!selectedGroup) {
      setLoading(false);
      return;
    }
  
    const q = query(
      collection(db, 'chatGroups', selectedGroup.id, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = [];
      snapshot.forEach((doc) => {
        messageData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messageData.reverse());
      setLoading(false);
      scrollToBottom();
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [selectedGroup]);

  // Update handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await addDoc(collection(db, `chatGroups/${selectedGroup.id}/messages`), {
        text: newMessage,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'ผู้ใช้ไม่ระบุชื่อ',
        userPhoto: auth.currentUser.photoURL
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Add delete group handler
  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบกลุ่มนี้?')) {
      try {
        await deleteDoc(doc(db, 'chatGroups', groupId));
        setSelectedGroup(null);
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะออกจากกลุ่มนี้?')) {
      try {
        const groupRef = doc(db, 'chatGroups', groupId);
        await updateDoc(groupRef, {
          members: arrayRemove(auth.currentUser.uid)
        });
        setSelectedGroup(null);
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  // Update the chat area section
  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)', 
        py: isMobile ? 0 : 2,
        px: isMobile ? 0 : 2
      }}
    >
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Groups Sidebar */}
        <Paper 
          sx={{ 
            width: 280,
            display: { xs: selectedGroup ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            borderRadius: isMobile ? 0 : '4px 0 0 4px',
            borderRight: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>กลุ่มแชท</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setShowCreateGroup(true)}
                size="small"
                fullWidth
              >
                สร้างกลุ่ม
              </Button>
              <Button
                startIcon={<GroupAddIcon />}
                variant="outlined"
                onClick={() => setShowJoinGroup(true)}
                size="small"
              >
                เข้าร่วม
              </Button>
            </Box>
          </Box>
      
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {groups.map(group => (
              <Paper
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  bgcolor: selectedGroup?.id === group.id ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Typography variant="subtitle2">{group.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {group.isPrivate ? '🔒 กลุ่มส่วนตัว' : '🌐 กลุ่มสาธาระ'}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      
        {/* Chat Area */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && selectedGroup && (
                <IconButton 
                  size="small" 
                  onClick={() => setSelectedGroup(null)}
                  sx={{ color: 'white' }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="500">
                {selectedGroup ? selectedGroup.name : 'เลือกกลุ่มแชท'}
              </Typography>
            </Box>
            {selectedGroup && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedGroup?.isPrivate && (
                  <Tooltip title="รหัสกลุ่ม">
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      🔑 {selectedGroup.groupCode}
                    </Typography>
                  </Tooltip>
                )}
                {selectedGroup?.createdBy === auth.currentUser.uid ? (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteGroup(selectedGroup.id)}
                    sx={{ color: 'white' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => handleLeaveGroup(selectedGroup.id)}
                    sx={{ color: 'white' }}
                  >
                    <LogoutIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
      
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.userId === auth.currentUser?.uid;
                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <Tooltip title={message.userName} placement={isCurrentUser ? "left" : "right"}>
                      <Avatar 
                        src={message.userPhoto} 
                        sx={{ 
                          width: isMobile ? 32 : 40, 
                          height: isMobile ? 32 : 40,
                          boxShadow: 1
                        }} 
                      />
                    </Tooltip>
                    <Box
                      sx={{
                        maxWidth: isMobile ? '75%' : '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ mb: 0.5, fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                      >
                        {message.userName}
                      </Typography>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          bgcolor: isCurrentUser ? 'primary.main' : 'white',
                          color: isCurrentUser ? 'white' : 'inherit',
                          borderRadius: 2,
                          maxWidth: '100%',
                          wordBreak: 'break-word'
                        }}
                      >
                        <Typography sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                          {message.text}
                        </Typography>
                      </Paper>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                      >
                        {formatDistanceToNow(message.createdAt.toDate(), { 
                          addSuffix: true,
                          locale: th 
                        })}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>
      
          {selectedGroup && (
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                p: 2,
                display: 'flex',
                gap: 1,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              <TextField
                fullWidth
                placeholder="พิมพ์ข้อความ..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#f5f5f5'
                  }
                }}
              />
              <IconButton 
                type="submit" 
                color="primary"
                disabled={!newMessage.trim()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          )}
        </Paper>
      
        <ChatGroupDialog
          open={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
        />
      
        <JoinGroupDialog
          open={showJoinGroup}
          onClose={() => setShowJoinGroup(false)}
        />
      </Box>
    </Container>
  );
}

export default Chat;