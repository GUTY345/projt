import { Container, Typography, Grid, Card, CardContent, Box, Button, useTheme, useMediaQuery, 
         Modal, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChatIcon from '@mui/icons-material/Chat';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BugFixIcon from '@mui/icons-material/BugReport';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  
  // ข้อมูลการอัปเดตล่าสุด
  const latestUpdate = {
    version: "1.0.3",
    date: "25 มีนาคม 2025",
    features: [
      { type: 'new', text: 'เพิ่มฟีเจอร์ยังไม่มีการอัพเดท' },
      { type: 'new', text: 'เพิ่มยังไม่มีการอัพเดท' },
      { type: 'improvement', text: 'ปรับปรุงประสิทธิภาพการโหลดข้อความในแชท' },
      { type: 'improvement', text: 'ปรับปรุง UI ให้ใช้งานง่ายขึ้นบนอุปกรณ์มือถือ' },
      { type: 'bugfix', text: 'แก้ไขปัญหารหัสเข้าร่วมกลุ่มไม่แสดง' },
      { type: 'bugfix', text: 'แก้ไขปัญหาแชทกลุ่มไม่สามารถเข้าร่วมได้' },
      { type: 'announcement', text: 'ฟีเจอร์มู้ดบอร์ดถูกปิดชั่วคราวเพื่อปรับปรุงประสิทธิภาพ' }
    ]
  };

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้เคยเห็นการอัปเดตล่าสุดหรือยัง
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    if (!lastSeenVersion || lastSeenVersion !== latestUpdate.version) {
      setOpenUpdateModal(true);
    }
  }, []);

  const handleCloseUpdateModal = () => {
    // บันทึกเวอร์ชันล่าสุดที่ผู้ใช้เห็นแล้ว
    localStorage.setItem('lastSeenVersion', latestUpdate.version);
    setOpenUpdateModal(false);
  };

  const features = [
    {
      title: 'เชื่อมโยงไอเดีย',
      description: 'แชร์และเชื่อมโยงความคิดสร้างสรรค์ร่วมกับทีมของคุณ สร้างแผนผังความคิดและจัดระเบียบไอเดียได้อย่างไร้ขีดจำกัด',
      icon: <LightbulbIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/ideas',
      color: '#009688',
      gradient: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)'
    },
    {
      title: 'แชทกลุ่ม',
      description: 'สื่อสารและระดมความคิดแบบเรียลไทม์ แชร์ไฟล์และเอกสารได้อย่างรวดเร็ว พร้อมฟีเจอร์การแจ้งเตือนที่ครบครัน',
      icon: <ChatIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/chat',
      color: '#26A69A',
      gradient: 'linear-gradient(135deg, #26A69A 0%, #80CBC4 100%)'
    },
    {
      title: 'มู้ดบอร์ด (ปิดปรับปรุง)',
      description: 'ฟีเจอร์นี้กำลังอยู่ระหว่างการปรับปรุง จะกลับมาให้บริการเร็วๆ นี้ พร้อมฟังก์ชันการทำงานที่ดีขึ้น',
      icon: <ColorLensIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/maintenance',
      color: '#9E9E9E',
      gradient: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
      disabled: true
    },
    {
      title: 'ทำงานร่วมกัน',
      description: 'แชร์โน้ตและทำงานร่วมกันแบบเรียลไทม์ พร้อมระบบติดตามการเปลี่ยนแปลงและประวัติการแก้ไข',
      icon: <GroupIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/notes',
      color: '#00796B',
      gradient: 'linear-gradient(135deg, #00796B 0%, #4DB6AC 100%)'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      pb: isMobile ? '72px' : 0, // เพิ่ม padding bottom สำหรับ bottom nav
      mt: isMobile ? '64px' : 0  // ปรับ margin top ให้พอดีกับ navbar
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
        pt: isMobile ? 3 : 10,   // ลด padding top บนมือถือ
        pb: isMobile ? 3 : 12,   // ลด padding bottom บนมือถือ
        px: isMobile ? 2 : 4,
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        <Typography 
          variant="h3" 
          sx={{
            fontWeight: 700,
            fontSize: isMobile ? '1.75rem' : '3rem',
            mb: 2,
            letterSpacing: '-0.02em'
          }}
        >
          NoteNova
        </Typography>
        <Typography 
          sx={{
            fontSize: isMobile ? '0.95rem' : '1.25rem',
            maxWidth: '600px',
            mx: 'auto',
            fontWeight: 500,
            opacity: 0.95
          }}
        >
          จดบันทึกอัจฉริยะ จัดการความคิดของคุณ
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ 
        flex: 1,
        py: isMobile ? 1.5 : 3,  // ลด padding บนมือถือ
        px: isMobile ? 1 : 3,
        mt: isMobile ? -1 : -4   // ปรับ overlap น้อยลงบนมือถือ
      }}>
        <Grid container spacing={isMobile ? 1 : 2}>  {/* ลด spacing ระหว่าง cards */}
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                onClick={() => navigate(feature.path)}
                sx={{
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: isMobile ? 1 : 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.02)',
                    transform: 'none'  // ปิด hover effect บนมือถือ
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: isMobile ? 1.25 : 2,  // ลด padding ของ card content
                  '&:last-child': { pb: isMobile ? 1.25 : 2 }  // แก้ปัญหา padding bottom ไม่เท่ากัน
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: isMobile ? 1.5 : 2 }}>
                    <Box sx={{
                      background: feature.gradient,
                      borderRadius: isMobile ? 1 : 1.5,
                      p: isMobile ? 1 : 1.5,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#1A1A1A', mb: 0.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        color: '#666666',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Modal แสดงการอัปเดต */}
      <Modal
        open={openUpdateModal}
        onClose={handleCloseUpdateModal}
        aria-labelledby="update-modal-title"
        aria-describedby="update-modal-description"
      >
        <Paper sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '90%' : 500,
          maxHeight: '90vh',
          overflow: 'auto',
          p: 3,
          borderRadius: 2,
          outline: 'none',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="update-modal-title" variant="h6" component="h2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <UpdateIcon sx={{ mr: 1, color: '#009688' }} />
              มีอัปเดตใหม่!
            </Typography>
            <Button 
              onClick={handleCloseUpdateModal}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <CloseIcon />
            </Button>
          </Box>
          
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            เวอร์ชัน {latestUpdate.version} ({latestUpdate.date})
          </Typography>
          
          <Divider sx={{ my: 1.5 }} />
          
          <List sx={{ pt: 0 }}>
            {latestUpdate.features.map((feature, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {feature.type === 'new' ? (
                    <NewReleasesIcon sx={{ color: '#009688' }} />
                  ) : feature.type === 'bugfix' ? (
                    <BugFixIcon sx={{ color: '#F44336' }} />
                  ) : feature.type === 'announcement' ? (
                    <CloseIcon sx={{ color: '#FF9800' }} />
                  ) : (
                    <UpdateIcon sx={{ color: '#2196F3' }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={feature.text} 
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { 
                      fontSize: '0.9rem',
                      fontWeight: feature.type === 'announcement' ? 500 : 400,
                      color: feature.type === 'announcement' ? '#FF9800' : 'inherit'
                    }
                  }} 
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleCloseUpdateModal}
              sx={{ 
                bgcolor: '#009688', 
                '&:hover': { bgcolor: '#00796B' },
                borderRadius: '8px',
                px: 3
              }}
            >
              เข้าใจแล้ว
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
}

export default Home;