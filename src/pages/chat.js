import { useState, useEffect, useRef, useCallback } from 'react';
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
import { collection, query, orderBy, limit, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
import VideoCallIcon from '@mui/icons-material/VideoCall';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  // Add missing state declarations
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Update scrollToBottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Add useEffect for auto-scrolling when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
  }, [selectedGroup]);

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
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [selectedGroup]);

  // บบบบบบบบบบ
  // const unsubscribe = onSnapshot(q, (snapshot) => { ... });

  // Update handleSubmit
  // Add at the top with other imports
  const messageSound = new Audio('/message-sent.mp3');
  
  // Update handleSubmit function
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
        messageSound.play().catch(err => console.log('Audio playback failed:', err));
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
        
        // Add system message about leaving
        await addDoc(collection(db, `chatGroups/${groupId}/messages`), {
          text: `${auth.currentUser.displayName || 'ผู้ใช้'} ได้ออกจากกลุ่ม`,
          createdAt: new Date(),
          isSystemMessage: true
        });

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
      maxWidth={false} 
      disableGutters
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#ffffff'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        height: '100%',
        overflow: 'hidden',
        pt: { xs: '56px', md: '64px' },
        pb: { xs: '56px', md: 0 }
      }}>
        {/* Groups Sidebar */}
        <Paper 
          elevation={0}
          sx={{ 
            width: { xs: '100%', md: 360 },
            height: '100%',
            position: 'relative',
            display: { xs: selectedGroup ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: '#ffffff'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>แชท</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setShowCreateGroup(true)}
                size="small"
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                สร้างกลุ่มใหม่
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 1 }}>
            {groups.map(group => (
              <Box
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                sx={{
                  p: 1.5,
                  mb: 0.5,
                  cursor: 'pointer',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.2s',
                  bgcolor: selectedGroup?.id === group.id ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Avatar sx={{ width: 48, height: 48 }}>
                  {group.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={500} noWrap>
                    {group.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {group.isPrivate ? '🔒 กลุ่มส่วนตัว' : '🌐 กลุ่มสาธาระ'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Chat Area */}
        <Box 
          sx={{ 
            flex: 1,
            height: '100%',
            position: 'relative',
            display: { xs: selectedGroup ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            bgcolor: '#ffffff'
          }}
        >
          {/* Chat Header */}
          <Box sx={{ 
            px: 2, 
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            {isMobile && (
              <IconButton 
                size="small" 
                onClick={() => setSelectedGroup(null)}
                sx={{ color: 'text.primary' }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            {selectedGroup && (
              <>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {selectedGroup.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {selectedGroup.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedGroup.isPrivate ? '🔒 กลุ่มส่วนตัว' : '🌐 กลุ่มสาธาระ'}
                  </Typography>
                </Box>
                <Box>
                  {selectedGroup.createdBy === auth.currentUser.uid ? (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteGroup(selectedGroup.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                    >
                      <LogoutIcon />
                    </IconButton>
                  )}
                </Box>
              </>
            )}
          </Box>

          {/* Messages Area */}
          <Box 
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
              px: 2,
              py: 3,
              bgcolor: '#f0f2f5'
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

          {/* Message Input */}
          {selectedGroup && (
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                p: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Aa"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: '#f0f2f5',
                      '&:hover': {
                        bgcolor: '#e4e6eb'
                      }
                    }
                  }}
                />
                <IconButton 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: { xs: 36, md: 44 },
                    height: { xs: 36, md: 44 },
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#e4e6eb',
                      color: '#bcc0c4'
                    }
                  }}
                >
                  <SendIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
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
  const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
  
  // ตรวจสอบว่าควรแสดงส่วนหัวของวันที่หรือไม่
  const showDateHeader = !prevMessage || 
    !isSameDay(message.createdAt.toDate(), prevMessage.createdAt.toDate());
    
  // ตรวจสอบว่าเป็นข้อความของผู้ใช้ปัจจุบันหรือไม่
  const isCurrentUser = message.userId === auth.currentUser?.uid;
  const isSystemMessage = message.isSystemMessage;
  
  // ตรวจสอบว่าควรแสดง Avatar หรือไม่ (ไม่แสดงถ้าเป็นข้อความต่อเนื่องจากผู้ใช้เดียวกัน)
  const showAvatar = !nextMessage || 
    nextMessage.userId !== message.userId || 
    (nextMessage.createdAt.toDate() - message.createdAt.toDate()) > 60000; // 1 นาที

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
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            {formatDate(message.createdAt.toDate(), 'EEEE, MMMM d', { locale: th })}
          </Typography>
        </Box>
      )}
      <Box>
        {isSystemMessage ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            my: 1 
          }}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 0.5,
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: 5,
                color: 'text.secondary',
                fontStyle: 'italic'
              }}
            >
              {message.text}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: isCurrentUser ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: 1,
              mb: 0.75,
              px: 0.5
            }}
          >
            {showAvatar ? (
              <Tooltip title={message.userName} placement={isCurrentUser ? "left" : "right"}>
                <Avatar 
                  src={message.userPhoto} 
                  sx={{ 
                    width: 28, 
                    height: 28,
                    opacity: 0.9,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      opacity: 1
                    }
                  }} 
                />
              </Tooltip>
            ) : (
              <Box sx={{ width: 28, height: 28, flexShrink: 0 }} /> // Placeholder เพื่อรักษาการจัดวาง
            )}
            <Box
              sx={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
              }}
            >
              {(!prevMessage || prevMessage.userId !== message.userId) && !isCurrentUser && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    ml: 0.5, 
                    mb: 0.3, 
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    color: 'text.secondary'
                  }}
                >
                  {message.userName}
                </Typography>
              )}
              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  bgcolor: isCurrentUser ? '#009688' : 'background.paper',
                  color: isCurrentUser ? 'white' : 'inherit',
                  borderRadius: 2,
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  boxShadow: isCurrentUser 
                    ? '0 1px 2px rgba(0, 150, 136, 0.15)'
                    : '0 1px 2px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {message.text}
                </Typography>
              </Paper>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  mt: 0.3,
                  fontSize: '0.65rem',
                  opacity: 0.8,
                  px: 0.5
                }}
              >
                {formatDistanceToNow(message.createdAt.toDate(), { 
                  addSuffix: true,
                  locale: th 
                })}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Remove everything below this line:
// - The duplicate import { serverTimestamp } from 'firebase/firestore';
// - The handleSendMessage function
