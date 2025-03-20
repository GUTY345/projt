import { createTheme } from '@mui/material/styles';

const createAppTheme = (darkMode = false) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#FF4848',
      contrastText: '#fff'
    },
    secondary: {
      main: '#4ECDC4',
      light: '#71D7D0',
      dark: '#3BA39B',
      contrastText: '#fff'
    },
    background: {
      default: darkMode ? '#121212' : '#F7F9FC',
      paper: darkMode ? '#1E1E1E' : '#FFFFFF'
    }
  },
  typography: {
    fontFamily: [
      'Prompt',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
    },
    h2: {
      fontWeight: 600,
      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
    },
    h3: {
      fontWeight: 600,
      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
    },
    h4: {
      fontWeight: 500,
      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
    },
    h5: {
      fontWeight: 500,
      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
    },
    h6: {
      fontWeight: 500,
      fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
    },
    body1: {
      fontSize: { xs: '0.875rem', sm: '1rem' }
    },
    body2: {
      fontSize: { xs: '0.75rem', sm: '0.875rem' }
    }
  },
  shape: {
    borderRadius: 8
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)'
          }
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.1)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.02)'
            },
            '&.Mui-focused': {
              boxShadow: '0px 0px 8px rgba(255,107,107,0.2)'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          border: '2px solid #fff'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s ease-in-out'
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)'
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 8px 32px rgba(0,0,0,0.08)'
        }
      }
    }
  }
});

export default createAppTheme;