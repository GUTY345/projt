import { useState, useEffect, useRef } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Card, CardContent, 
  Grid, Avatar, IconButton, Paper, CircularProgress, Divider, useTheme, 
  useMediaQuery, Tooltip, Fade, Zoom, Chip, AppBar, Toolbar, Drawer
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ImageIcon from '@mui/icons-material/Image';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import MenuIcon from '@mui/icons-material/Menu';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CodeIcon from '@mui/icons-material/Code';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Flashcards() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef(null);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      text: 'สวัสดีครับ! ผมเป็น AI Assistant ที่พร้อมช่วยเหลือคุณ\n\nผมสามารถช่วยคุณได้หลายอย่าง เช่น:\n• ตอบคำถามทั่วไป\n• ช่วยเขียนโค้ด\n• สรุปข้อมูล\n• แปลภาษา\n\nลองถามคำถามได้เลยครับ!', 
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'การสนทนาเกี่ยวกับการเรียนรู้', date: '12 มิ.ย. 2023' },
    { id: 2, title: 'คำถามเกี่ยวกับวิทยาศาสตร์', date: '10 มิ.ย. 2023' }
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [suggestions] = useState([
    "ช่วยเขียนโค้ด React สำหรับแอพจดบันทึก",
    "อธิบายแนวคิด Machine Learning แบบง่ายๆ",
    "แนะนำวิธีการเรียนรู้ภาษาอังกฤษที่มีประสิทธิภาพ"
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer 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',
            'HTTP-Referer': 'https://www.projt.com',
            'X-Title': 'AI ChatBot',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-r1:free',
            messages: [{ role: 'user', content: messageText }],
          }),
        }
      );
      const data = await response.json();
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: data.choices?.[0]?.message?.content || 'ขออภัย ฉันไม่สามารถประมวลผลคำขอของคุณได้ในขณะนี้',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (chatHistory.length === 0 || chatHistory[0].title !== messageText.substring(0, 30)) {
        const newChat = {
          id: Date.now(),
          title: messageText.substring(0, 30) + (messageText.length > 30 ? '...' : ''),
          date: new Date().toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: 'numeric'})
        };
        setChatHistory(prev => [newChat, ...prev]);
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([
      { 
        id: 1, 
        sender: 'bot', 
        text: 'สวัสดีครับ! ผมเป็น AI Assistant ที่พร้อมช่วยเหลือคุณ\n\nผมสามารถช่วยคุณได้หลายอย่าง เช่น:\n• ตอบคำถามทั่วไป\n• ช่วยเขียนโค้ด\n• สรุปข้อมูล\n• แปลภาษา\n\nลองถามคำถามได้เลยครับ!', 
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    ]);
  };

  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';
    
    return (
      <Fade in key={message.id}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isBot ? 'flex-start' : 'flex-end',
            mb: 3,
            maxWidth: { xs: '100%', sm: '85%', md: '75%' },
            px: { xs: 1.5, sm: 4 },
            py: { xs: 1.5, sm: 2.5 },
            bgcolor: isBot ? 'rgba(240, 242, 245, 0.8)' : 'rgba(0, 120, 212, 0.05)',
            borderRadius: 4,
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: isBot ? 'slideInLeft 0.3s ease' : 'slideInRight 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 1
            },
            mx: { xs: 1.5, sm: 3 },
            border: isBot ? 'none' : '1px solid rgba(0, 120, 212, 0.1)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'flex-start',
              width: '100%',
              gap: 1.5
            }}
          >
            <Zoom in>
              <Avatar
                sx={{
                  bgcolor: isBot ? '#0078D4' : '#5C6BC0',
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 1, sm: 0 },
                  boxShadow: 1,
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '1rem', sm: '1.5rem' }
                  }
                }}
              >
                {isBot ? <AutoAwesomeIcon /> : <PersonIcon />}
              </Avatar>
            </Zoom>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: isBot ? '#0078D4' : '#5C6BC0',
                    fontWeight: 700,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {isBot ? 'AI Assistant' : 'คุณ'}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    ml: { xs: 0, sm: 1.5 },
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  }}
                >
                  {message.timestamp}
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                component="div" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  lineHeight: 1.7,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  animation: 'fadeIn 0.5s ease',
                  '& code': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    display: 'inline-block',
                    margin: '2px 0'
                  },
                  '& pre': {
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    padding: { xs: '12px', sm: '16px' },
                    borderRadius: '8px',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    margin: '12px 0'
                  }
                }}
              >
                {message.text}
              </Typography>
              {isBot && (
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, mt: 1.5, flexWrap: 'wrap' }}>
                  <Tooltip title="คัดลอก">
                    <IconButton 
                      size="small" 
                      onClick={() => copyMessage(message.text)}
                      sx={{ 
                        color: '#666',
                        '&:hover': { 
                          bgcolor: 'rgba(0, 120, 212, 0.1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'transform 0.2s'
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ดี">
                    <IconButton 
                      size="small"
                      sx={{ 
                        color: '#666',
                        '&:hover': { 
                          bgcolor: 'rgba(0, 120, 212, 0.1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'transform 0.2s'
                      }}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ไม่ดี">
                    <IconButton 
                      size="small"
                      sx={{ 
                        color: '#666',
                        '&:hover': { 
                          bgcolor: 'rgba(0, 120, 212, 0.1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'transform 0.2s'
                      }}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Fade>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>
        {`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}
      </style>

      <AppBar 
        position="fixed" 
        color="default" 
        elevation={0}
        sx={{ 
          borderBottom: '1px solid #E0E0E0',
          bgcolor: 'white',
          zIndex: 1300
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              '&:hover': { transform: 'rotate(90deg)', transition: 'transform 0.3s ease' }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Zoom in>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeIcon sx={{ color: '#0078D4', mr: 1, animation: 'bounce 2s infinite' }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#0078D4' }}>
                AI Nova
              </Typography>
            </Box>
          </Zoom>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="หน้าหลัก">
            <IconButton 
              color="inherit" 
              sx={{ 
                mr: 1,
                '&:hover': { transform: 'scale(1.2)', transition: 'transform 0.3s ease' }
              }}
              onClick={() => window.location.href = '/'}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ตั้งค่า">
            <IconButton 
              color="inherit"
              sx={{ '&:hover': { transform: 'rotate(180deg)', transition: 'transform 0.3s ease' } }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '56px', sm: '64px' } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? drawerOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              top: { xs: '56px', sm: '64px' },
              height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' },
              borderRight: '1px solid #E0E0E0',
              bgcolor: '#F9FAFB',
            }
          }}
        >
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Button 
              variant="contained" 
              fullWidth 
              startIcon={<ChatIcon />}
              onClick={() => { clearChat(); if (isMobile) handleDrawerToggle(); }}
              sx={{ 
                mb: 2,
                borderRadius: 1,
                bgcolor: '#0078D4',
                '&:hover': { 
                  bgcolor: '#106EBE',
                  transform: 'scale(1.05)'
                },
                transition: 'transform 0.3s ease',
                animation: 'bounce 2s infinite'
              }}
            >
              สนทนาใหม่
            </Button>
            <Typography variant="subtitle2" sx={{ mb: 1, px: 1, color: '#666', fontWeight: 600 }}>
              ประวัตการสนทนา
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {chatHistory.map(chat => (
                <Fade in key={chat.id}>
                  <Box
                    sx={{
                      p: 1.5,
                      mb: 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: selectedChat === chat.id ? 'rgba(0, 120, 212, 0.1)' : 'transparent',
                      '&:hover': { 
                        bgcolor: 'rgba(0, 120, 212, 0.05)',
                        transform: 'translateX(5px)'
                      },
                      transition: 'transform 0.3s ease',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      setSelectedChat(chat.id);
                      if (isMobile) handleDrawerToggle();
                    }}
                  >
                    <ChatIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {chat.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {chat.date}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Box>
        </Drawer>

        <Box 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
            position: 'relative',
            overflow: 'hidden',
            width: { xs: '100%', sm: 'calc(100% - 280px)' },
            ml: { xs: 0, sm: isMobile ? 0 : '280px' },
            pb: { xs: 'calc(120px + env(safe-area-inset-bottom, 0))', sm: '80px' }
          }}
        >
          <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', pb: { xs: 3, sm: 2 } }}>
            {messages.length === 1 && (
              <Fade in>
                <Box sx={{ p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: { xs: 2, sm: 4 } }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 600, 
                      color: '#0078D4', 
                      textAlign: 'center',
                      animation: 'fadeIn 1s ease'
                    }}
                  >
                    ยินดีต้อนรับสู่ AI Nova
                  </Typography>
                  <Grid container spacing={2} sx={{ maxWidth: 800, mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <Zoom in>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            border: '1px solid #E0E0E0',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                        >
                          <LightbulbIcon sx={{ fontSize: 40, color: '#0078D4', mb: 1, animation: 'bounce 2s infinite' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            ถามคำถาม
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ถามได้ทุกเรื่อง ไม่ว่าจะเป็นความรู้ทั่วไป วิทยาศาสตร์ หรือประวัติศาสตร์
                          </Typography>
                        </Paper>
                      </Zoom>
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    ลองถามด้วยคำถามเหล่านี้
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', px: { xs: 1, sm: 2 } }}>
                    {suggestions.map((suggestion, index) => (
                      <Zoom in key={index}>
                        <Chip
                          label={suggestion}
                          onClick={() => handleSendMessage(suggestion)}
                          sx={{ 
                            borderRadius: 1,
                            py: 2,
                            px: 1,
                            bgcolor: 'rgba(0, 120, 212, 0.1)',
                            color: '#0078D4',
                            '&:hover': {
                              bgcolor: 'rgba(0, 120, 212, 0.2)',
                              transform: 'scale(1.05)'
                            },
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer',
                            mb: 1
                          }}
                        />
                      </Zoom>
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}
            
            {messages.map(message => renderMessage(message))}
            
            {loading && (
              <Fade in>
                <Box sx={{ display: 'flex', px: { xs: 2, md: 4 }, py: 2, bgcolor: 'rgba(240, 242, 245, 0.5)' }}>
                  <Avatar
                    sx={{
                      bgcolor: '#0078D4',
                      width: 36,
                      height: 36,
                      mr: 2,
                      animation: 'bounce 1s infinite'
                    }}
                  >
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1, color: '#0078D4' }} />
                    <Typography sx={{ color: '#666', animation: 'fadeIn 0.5s ease' }}>
                      กำลังคิด...
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
          
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 1, sm: 2 },
              position: 'fixed',
              bottom: 0,
              left: { xs: 0, sm: isMobile ? 0 : '280px' },
              right: 0,
              borderTop: '1px solid #E0E0E0',
              bgcolor: '#fff',
              zIndex: 1200,
              borderRadius: { xs: '16px 16px 0 0', sm: 0 },
              mx: { xs: 0, sm: 0 },
              boxShadow: { xs: '0px -2px 10px rgba(0, 0, 0, 0.1)', sm: '0px -1px 5px rgba(0, 0, 0, 0.05)' },
              animation: 'slideUp 0.5s ease'
            }}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item xs>
                <TextField
                  fullWidth
                  placeholder="พิมพ์ข้อความของคุณที่นี่..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={isMobile ? 2 : 4}
                  variant="outlined"
                  InputProps={{
                    sx: {
                      borderRadius: 1,
                      padding: { xs: '8px 12px', sm: '16px' },
                      '& fieldset': { borderColor: '#E0E0E0' },
                      '&:hover fieldset': { borderColor: '#0078D4' },
                      '&.Mui-focused fieldset': { borderColor: '#0078D4' },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
              <Grid item>
                <Tooltip title={isRecording ? "หยุดบันทึกเสียง" : "บันทึกเสียง"}>
                  <IconButton 
                    color={isRecording ? "error" : "default"} 
                    onClick={toggleRecording}
                    sx={{ 
                      color: isRecording ? '#d32f2f' : '#666',
                      display: { xs: 'none', sm: 'flex' },
                      '&:hover': { transform: 'scale(1.2)', transition: 'transform 0.3s ease' }
                    }}
                  >
                    {isRecording ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  endIcon={!isMobile && <SendIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || loading}
                  sx={{ 
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 3 },
                    py: { xs: 1, sm: 1 },
                    bgcolor: '#0078D4',
                    '&:hover': { 
                      bgcolor: '#106EBE',
                      transform: 'scale(1.05)'
                    },
                    transition: 'transform 0.3s ease',
                    textTransform: 'none',
                    minWidth: 'auto',
                    height: '100%',
                    '& .MuiButton-endIcon': { ml: { xs: 0.5, sm: 1 } }
                  }}
                >
                  {isMobile ? 'ส่ง' : 'ส่ง'}
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              <Typography variant="caption" color="text.secondary">
                Powered by DeepSeek AI • ใช้ข้อมูลอย่างรับผิดชอบ
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default Flashcards;