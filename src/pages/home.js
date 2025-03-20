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
      icon: <LightbulbIcon sx={{ fontSize: isMobile ? 24 : 26 }} />,
      path: '/ideas',
      color: '#FF7B7B'
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
      minHeight: '100vh',
      bgcolor: '#F2F2F7',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{
        bgcolor: '#FF7B7B',
        pt: 8, // Increased top padding
        pb: 4, // Increased bottom padding
        px: 3,
        color: 'white',
        textAlign: 'center'
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            fontSize: isMobile ? '2rem' : '2.25rem',
            mb: 2, // Increased margin
            letterSpacing: '-0.5px'
          }}
        >
          StudyHub
        </Typography>
        <Typography
          sx={{
            fontSize: '1rem',
            opacity: 0.95,
            maxWidth: '500px',
            mx: 'auto',
            px: 3,
            fontWeight: 400,
            lineHeight: 1.6
          }}
        >
          แพลตฟอร์มสำหรับการแชร์ไอเดีย ทำงานกลุ่ม และเรียนรู้ร่วมกัน
        </Typography>
      </Box>

      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1,
          py: 4, // Increased padding
          px: isMobile ? 3 : 4
        }}
      >
        <Grid container spacing={3}> {/* Increased grid spacing */}
          {features.map((feature) => (
            <Grid item xs={6} sm={6} md={3} key={feature.title}>
              <Card
                onClick={() => navigate(feature.path)}
                sx={{
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4, // Increased border radius
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(0,0,0,0.06)',
                  '&:active': {
                    transform: 'scale(0.98)',
                    bgcolor: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: isMobile ? 2.5 : 3, // Increased padding
                  '&:last-child': { pb: isMobile ? 2.5 : 3 }
                }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 2 // Added gap between elements
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: feature.color,
                        borderRadius: '20px', // Increased border radius
                        p: 2,
                        color: 'white',
                        width: isMobile ? '52px' : '56px',
                        height: isMobile ? '52px' : '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        color: '#000000',
                        letterSpacing: '-0.3px',
                        mb: 1
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: isMobile ? '0.85rem' : '0.9rem',
                        lineHeight: 1.5,
                        color: '#666666',
                        px: 1
                      }}
                    >
                      {feature.description}
                    </Typography>
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