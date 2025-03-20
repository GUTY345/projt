import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import App from './app';

// Font imports
import '@fontsource/prompt/300.css';
import '@fontsource/prompt/400.css';
import '@fontsource/prompt/500.css';
import '@fontsource/prompt/600.css';
import '@fontsource/prompt/700.css';

// Global styles
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Error Boundary for production
if (process.env.NODE_ENV === 'production') {
  const handleError = (error) => {
    console.error('Application Error:', error);
    // You can add error reporting service here
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleError);
}

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Enable hot reload in development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}