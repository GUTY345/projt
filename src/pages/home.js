import { Container, Typography, Grid, Card, CardContent, Box, Button, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChatIcon from '@mui/icons-material/Chat';
import ColorLensIcon from '@mui/icons-material/ColorLens';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      title: 'เชื่อมโยงไอเดีย',
      description: 'แชร์และเชื่อมโยงความคิดสร้างสรรค์ร่วมกับทีมของคุณ สร้างแผนผังความคิดและจัดระเบียบไอเดียได้อย่างไร้ขีดจำกัด',
      icon: <LightbulbIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/ideas',
      color: '#4A90E2',
      gradient: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
    },
    {
      title: 'แชทกลุ่ม',
      description: 'สื่อสารและระดมความคิดแบบเรียลไทม์ แชร์ไฟล์และเอกสารได้อย่างรวดเร็ว พร้อมฟีเจอร์การแจ้งเตือนที่ครบครัน',
      icon: <ChatIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/chat',
      color: '#67B26F',
      gradient: 'linear-gradient(135deg, #67B26F 0%, #4CA2CD 100%)'
    },
    {
      title: 'มู้ดบอร์ด',
      description: 'รวบรวมแรงบันดาลใจและไอเดียการออกแบบในที่เดียว จัดเรียงและแชร์ได้ง่าย พร้อมระบบแท็กที่ช่วยจัดหมวดหมู่',
      icon: <ColorLensIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/moodboard',
      color: '#45B7D1',
      gradient: 'linear-gradient(135deg, #45B7D1 0%, #2E94AB 100%)'
    },
    {
      title: 'ทำงานร่วมกัน',
      description: 'แชร์โน้ตและทำงานร่วมกันแบบเรียลไทม์ พร้อมระบบติดตามการเปลี่ยนแปลงและประวัติการแก้ไข',
      icon: <GroupIcon sx={{ fontSize: isMobile ? 28 : 32 }} />,
      path: '/notes',
      color: '#96CEB4',
      gradient: 'linear-gradient(135deg, #96CEB4 0%, #6BA890 100%)'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      pb: isMobile ? 8 : 0,
      mt: isMobile ? '56px' : 0
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #4A90E2 0%, #67B26F 100%)',
        pt: isMobile ? 4 : 10,
        pb: isMobile ? 4 : 12,
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
          MindMesh
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
          เชื่อมโยงความคิด สร้างสรรค์การเรียนรู้ร่วมกัน
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ 
        flex: 1,
        py: isMobile ? 2 : 3,
        px: isMobile ? 1 : 3,
        mt: isMobile ? -2 : -4
      }}>
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                onClick={() => navigate(feature.path)}
                sx={{
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: isMobile ? 1.5 : 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.02)',
                    transform: isMobile ? 'none' : 'translateY(-4px)'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
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
    </Box>
  );
}

export default Home;