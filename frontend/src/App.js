import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchRide from './pages/SearchRide';
import OfferRide from './pages/OfferRide';
import MyRides from './pages/MyRides';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchRide />} />
            <Route path="/offer" element={<OfferRide />} />
            <Route path="/my-rides" element={<MyRides />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
