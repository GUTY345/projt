import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth, db } from './firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Navbar from './components/navbar';
import Auth from './components/auth';
import WelcomeDialog from './components/welcomedialog';

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setShowWelcome(true);
        } else {
          setDarkMode(userDoc.data().darkMode);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#FF6B6B',
      },
      secondary: {
        main: '#4ECDC4',
      },
    },
    typography: {
      fontFamily: 'Prompt, sans-serif',
    },
  });

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {user ? (
          <>
            <Navbar user={user} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ideas" element={<IdeaBoard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/moodboard" element={<MoodBoard />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
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
      </Router>
    </ThemeProvider>
  );
}

export default App;