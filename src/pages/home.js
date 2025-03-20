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
      title: 'แชร์ไอเดีย',
      description: 'แบ่งปันไอเดียโปรเจกต์และงานกลุ่มกับเพื่อนๆ',
      icon: <LightbulbIcon sx={{ fontSize: isMobile ? 32 : 40 }} />,
      path: '/ideas',
      color: '#FF6B6B'
    },
    {
      title: 'แชทกลุ่ม',
      description: 'พูดคุยและระดมความคิดกับเพื่อนร่วมทีม',
      icon: <ChatIcon sx={{ fontSize: isMobile ? 32 : 40 }} />,
      path: '/chat',
      color: '#4ECDC4'
    },
    {
      title: 'มู้ดบอร์ด',
      description: 'รวบรวมแรงบันดาลใจและไอเดียการออกแบบ',
      icon: <ColorLensIcon sx={{ fontSize: isMobile ? 32 : 40 }} />,
      path: '/moodboard',
      color: '#45B7D1'
    },
    {
      title: 'ทำงานร่วมกัน',
      description: 'แชร์โน้ตและทำงานร่วมกันแบบเรียลไทม์',
      icon: <GroupIcon sx={{ fontSize: isMobile ? 32 : 40 }} />,
      path: '/notes',
      color: '#96CEB4'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
      pt: isMobile ? 4 : 8,
      pb: isMobile ? 4 : 6
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          textAlign: 'center', 
          color: 'white',
          mb: isMobile ? 4 : 8
        }}>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            sx={{
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              fontSize: isMobile ? '2.5rem' : '3.75rem'
            }}
          >
            StudyHub
          </Typography>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              px: isMobile ? 2 : 0,
              lineHeight: 1.5
            }}
          >
            แพลตฟอร์มสำหรับการแชร์ไอเดีย ทำงานกลุ่ม และเรียนรู้ร่วมกัน
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 2 : 4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  },
                  borderRadius: isMobile ? 2 : 4,
                  overflow: 'hidden',
                  boxShadow: 3
                }}
              >
                <Box
                  sx={{
                    p: isMobile ? 2 : 3,
                    textAlign: 'center',
                    bgcolor: feature.color,
                    color: 'white'
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  textAlign: 'center',
                  p: isMobile ? 2 : 3
                }}>
                  <Typography 
                    gutterBottom 
                    variant={isMobile ? "h6" : "h5"} 
                    component="h2"
                    sx={{ fontWeight: 500 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      mb: isMobile ? 2 : 3
                    }}
                  >
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(feature.path)}
                    sx={{
                      bgcolor: feature.color,
                      '&:hover': {
                        bgcolor: feature.color,
                        filter: 'brightness(0.9)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease',
                      px: isMobile ? 2 : 3,
                      py: isMobile ? 0.5 : 1,
                      borderRadius: '20px'
                    }}
                  >
                    เริ่มใช้งาน
                  </Button>
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