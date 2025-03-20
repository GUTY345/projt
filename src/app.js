import { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { 
  CssBaseline, 
  CircularProgress, 
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { auth, db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import theme from './styles/theme';

// Components
import Navbar from './components/navbar';
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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              displayName: user.displayName || 'ผู้ใช้ไม่ระบุชื่อ',
              email: user.email,
              photoURL: user.photoURL,
              darkMode: false,
              createdAt: new Date()
            });
            setShowWelcome(true);
          } else {
            setDarkMode(userDoc.data().darkMode);
          }
        }
        setUser(user);
      } catch (error) {
        console.error('Error loading user data:', error);
        setSnackbar({
          open: true,
          message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleThemeToggle = async () => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { darkMode: !darkMode }, { merge: true });
        setDarkMode(!darkMode);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'ไม่สามารถเปลี่ยนธีมได้',
          severity: 'error'
        });
      }
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme(darkMode)}>
        <CssBaseline />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme(darkMode)}>
      <CssBaseline />
      <Router>
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
                <Route path="/moodboard" element={<MoodBoard />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/profile" element={<Profile />} />
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
            <Route path="/" element={<Auth />} />
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
      </Router>
    </ThemeProvider>
  );
}

export default App;