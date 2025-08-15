import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import App from './App.tsx';

// Preload fonts
const preloadFonts = () => {
  // Load Inter font
  const interLink = document.createElement('link');
  interLink.rel = 'stylesheet';
  interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(interLink);
  
  // Load Roboto font (Material UI default)
  const robotoLink = document.createElement('link');
  robotoLink.rel = 'stylesheet';
  robotoLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
  document.head.appendChild(robotoLink);
  
  // Load Material Icons
  const iconsLink = document.createElement('link');
  iconsLink.rel = 'stylesheet';
  iconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(iconsLink);
};

// Initialize app
const init = () => {
  preloadFonts();
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StrictMode>
  );
};

init();
