import { useState, useEffect, useRef } from 'react';
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
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { collection, query, orderBy, limit, addDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

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

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
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
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
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

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)', 
        py: isMobile ? 0 : 2,
        px: isMobile ? 0 : 2
      }}
    >
      <Paper 
        elevation={isMobile ? 0 : 3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isMobile ? 0 : 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          boxShadow: 1
        }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="500">
            แชทกลุ่ม
          </Typography>
        </Box>

        <Box 
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#f5f5f5',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            }
          }}
        >
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
        
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{
            p: isMobile ? 1 : 2,
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
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            <SendIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
}

export default Chat;