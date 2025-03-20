import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChatIcon from '@mui/icons-material/Chat';
import ColorLensIcon from '@mui/icons-material/ColorLens';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'แชร์ไอเดีย',
      description: 'แบ่งปันไอเดียโปรเจกต์และงานกลุ่มกับเพื่อนๆ',
      icon: <LightbulbIcon sx={{ fontSize: 40 }} />,
      path: '/ideas',
      color: '#FF6B6B'
    },
    {
      title: 'แชทกลุ่ม',
      description: 'พูดคุยและระดมความคิดกับเพื่อนร่วมทีม',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      path: '/chat',
      color: '#4ECDC4'
    },
    {
      title: 'มู้ดบอร์ด',
      description: 'รวบรวมแรงบันดาลใจและไอเดียการออกแบบ',
      icon: <ColorLensIcon sx={{ fontSize: 40 }} />,
      path: '/moodboard',
      color: '#45B7D1'
    },
    {
      title: 'ทำงานร่วมกัน',
      description: 'แชร์โน้ตและทำงานร่วมกันแบบเรียลไทม์',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      path: '/notes',
      color: '#96CEB4'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)'
    }}>
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Box sx={{ 
          textAlign: 'center', 
          color: 'white',
          mb: 8 
        }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            StudyHub
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            แพลตฟอร์มสำหรับการแชร์ไอเดีย ทำงานกลุ่ม และเรียนรู้ร่วมกัน
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  },
                  borderRadius: 4
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: feature.color,
                    color: 'white'
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(feature.path)}
                    sx={{
                      bgcolor: feature.color,
                      '&:hover': {
                        bgcolor: feature.color,
                        filter: 'brightness(0.9)'
                      }
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