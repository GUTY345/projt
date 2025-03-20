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
import { formatDistanceToNow, formatDate, isSameDay } from 'date-fns';
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
            borderRadius: isMobile ? 0 : '12px 0 0 12px',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
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
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  bgcolor: selectedGroup?.id === group.id ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-1px)',
                    boxShadow: 1
                  }
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>{group.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {group.isPrivate ? '🔒 กลุ่มส่วนตัว' : '🌐 กลุ่มสาธาระ'}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      
        {/* Chat Area */}
        <Paper 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: isMobile ? 0 : '0 12px 12px 0',
            overflow: 'hidden'
          }}
        >
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
      
          <Box 
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2, 
              bgcolor: '#f8f9fa',
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '100% 48px'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              messages.map((message, index) => renderMessageGroup(messages, index))
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
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#f8f9fa',
                    '&:hover': {
                      bgcolor: '#fff'
                    },
                    '&.Mui-focused': {
                      bgcolor: '#fff'
                    }
                  }
                }}
              />
              <IconButton 
                type="submit" 
                disabled={!newMessage.trim()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 48,
                  height: 48,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.05)'
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

function renderMessageGroup(messages, index) {
  const message = messages[index];
  const prevMessage = index > 0 ? messages[index - 1] : null;
  const showDateHeader = !prevMessage || 
    !isSameDay(message.createdAt.toDate(), prevMessage.createdAt.toDate());
  const isCurrentUser = message.userId === auth.currentUser?.uid;

  return (
    <Box key={message.id}>
      {showDateHeader && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          my: 2,
          position: 'relative'
        }}>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 5,
              color: 'text.secondary'
            }}
          >
            {formatDate(message.createdAt.toDate(), 'EEEE, MMMM d', { locale: th })}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 1,
          mb: 1
        }}
      >
        <Tooltip title={message.userName} placement={isCurrentUser ? "left" : "right"}>
          <Avatar 
            src={message.userPhoto} 
            sx={{ 
              width: 32, 
              height: 32,
              opacity: 0.9,
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 1
              }
            }} 
          />
        </Tooltip>
        <Box
          sx={{
            maxWidth: '70%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: isCurrentUser ? 'primary.main' : 'background.paper',
              color: isCurrentUser ? 'white' : 'inherit',
              borderRadius: 2,
              maxWidth: '100%',
              wordBreak: 'break-word',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            <Typography sx={{ fontSize: '0.95rem' }}>
              {message.text}
            </Typography>
          </Paper>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              mt: 0.5,
              fontSize: '0.7rem',
              opacity: 0.8
            }}
          >
            {formatDistanceToNow(message.createdAt.toDate(), { 
              addSuffix: true,
              locale: th 
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
