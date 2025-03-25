import { useState, useEffect, Suspense, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  CircularProgress, 
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { auth, db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

// Remove duplicate theme imports
import createAppTheme from './styles/theme';

// Components
import Navbar from './components/navbar';
import Welcome from './components/Welcome'; // เปลี่ยนจาก welcome เป็น Welcome
import Auth from './components/auth';
import WelcomeDialog from './components/welcomedialog';
import LoadingScreen from './components/loadingscreen';

// Pages
import Home from './pages/home';
import IdeaBoard from './pages/ideaboard';
import Chat from './pages/chat';
import MoodBoard from './pages/moodboard';
import Notes from './pages/Notes';
import Profile from './pages/profile';
// เพิ่ม import ด้านบน
import Settings from './pages/settings';
import { ColorModeProvider } from './theme/ColorModeContext';

// Add this import at the top with other imports
import '@fontsource/prompt';
import '@fontsource/prompt/300';
import '@fontsource/prompt/500';
import '@fontsource/prompt/700';
import Flashcards from './pages/flashcards';

function App() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Create theme
  // Update the theme creation
  const appTheme = useMemo(() => 
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
      },
      typography: {
        fontFamily: [
          'Prompt',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
        h1: {
          fontWeight: 500,
        },
        h2: {
          fontWeight: 500,
        },
        h3: {
          fontWeight: 500,
        },
        h4: {
          fontWeight: 500,
        },
        h5: {
          fontWeight: 500,
        },
        h6: {
          fontWeight: 500,
        },
        subtitle1: {
          fontWeight: 300,
        },
        body1: {
          fontWeight: 300,
        }
      },
    }), 
    [darkMode]
  );

  useEffect(() => {
    if (user && !localStorage.getItem('welcomeShown')) {
      setShowWelcome(true);
      localStorage.setItem('welcomeShown', 'true');
    }
  }, [user]);

  const handleThemeToggle = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ColorModeProvider>
      <Router>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <Box sx={{ 
            minHeight: 'calc(var(--vh, 1vh) * 100)',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}>
            {user ? (
              <>
                <Navbar 
                  user={user} 
                  darkMode={darkMode}
                  onThemeToggle={handleThemeToggle}
                />
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/ideas" element={<IdeaBoard />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/profile/:userId?" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/flashcards" element={<Flashcards />} /> {/* Move this here */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
                <WelcomeDialog 
                  open={showWelcome} 
                  onClose={() => setShowWelcome(false)} 
                />
              </>
            ) : (
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            )}

            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
                severity={snackbar.severity}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </ThemeProvider>
      </Router>
    </ColorModeProvider>
  );
}

export default App;