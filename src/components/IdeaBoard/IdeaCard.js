import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';

const IdeaCard = ({ 
  idea, 
  isMobile, 
  handleLike, 
  handleIdeaClick, 
  handleProfileClick, 
  handleSnackbar, 
  loadingLike, 
  auth,
  CATEGORIES 
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
      }}
      onClick={() => handleIdeaClick(idea)}
    >
      <CardContent>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            cursor: 'pointer' 
          }}
          onClick={(e) => handleProfileClick(idea.userId, idea.userEmail, idea.userPhoto, e)}
        >
          <Avatar src={idea.userPhoto} sx={{ 
            mr: 1,
            width: 40,
            height: 40,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {idea.userName || idea.userEmail.split('@')[0]}
          </Typography>
        </Box>
        <Typography variant="h6" gutterBottom>{idea.title}</Typography>
        <Chip
          label={CATEGORIES.find((cat) => cat.id === idea.category)?.label}
          sx={{ mb: 1 }}
        />
        <Typography color="text.secondary" paragraph>
          {idea.description}
        </Typography>
        <Box>
          {idea.tags?.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      </CardContent>

      <Box
        sx={{
          mt: 'auto',
          p: isMobile ? 1 : 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <IconButton
          size={isMobile ? "small" : "medium"}
          onClick={(e) => {
            e.stopPropagation();
            handleLike(idea.id, e);
          }}
          disabled={loadingLike}
          color={idea.likedBy?.includes(auth.currentUser?.uid) ? "primary" : "default"}
          sx={{ 
            '&.Mui-disabled': { opacity: 0.5 },
            '&.MuiIconButton-colorPrimary': { 
              color: '#E91E63',
              '& .MuiSvgIcon-root': { 
                color: '#E91E63',
                fill: '#E91E63',
                fontSize: isMobile ? '1.2rem' : '1.5rem'
              }
            },
            padding: isMobile ? '6px' : '8px',
          }}
        >
          {loadingLike ? (
            <CircularProgress size={isMobile ? 14 : 16} />
          ) : (
            <>
              <ThumbUpIcon fontSize={isMobile ? "small" : "medium"} />
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 0.5,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {idea.likes || 0}
              </Typography>
            </>
          )}
        </IconButton>

        <IconButton
          size={isMobile ? "small" : "medium"}
          onClick={(e) => {
            e.stopPropagation();
            handleIdeaClick(idea);
          }}
          sx={{ 
            padding: isMobile ? '6px' : '8px',
            '& .MuiSvgIcon-root': {
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }
          }}
        >
          <CommentIcon fontSize={isMobile ? "small" : "medium"} />
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 0.5,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {idea.comments?.length || 0}
          </Typography>
        </IconButton>

        <IconButton
          size={isMobile ? "small" : "medium"}
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(`${window.location.origin}/idea/${idea.id}`);
            handleSnackbar('คัดลอกลิงก์สำเร็จ', 'success');
          }}
          sx={{ 
            padding: isMobile ? '6px' : '8px',
            '& .MuiSvgIcon-root': {
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }
          }}
        >
          <ShareIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Box>
    </Card>
  );
};

export default IdeaCard;