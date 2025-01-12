import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ bgcolor: '#FF8C00' }}>
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          الوحيس
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/')}>
            الرئيسية
          </Button>
          <Button color="inherit" onClick={() => navigate('/rider')}>
            احجز رحلة
          </Button>
          <Button color="inherit" onClick={() => navigate('/driver')}>
            كن سائقاً
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
