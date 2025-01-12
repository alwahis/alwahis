import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// Components (to be created)
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#FF8C00', // Dark orange
      light: '#FFA533',
      dark: '#CC7000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Cairo, sans-serif',
  },
});

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box dir="rtl">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rider" element={<RiderDashboard />} />
              <Route path="/driver" element={<DriverDashboard />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
