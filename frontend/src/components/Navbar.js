import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#FF8C00' }}>
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 2 }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }} 
          onClick={() => navigate('/')}
        >
          الوحيس
        </Typography>
        
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            الرئيسية
          </Button>
          <Button color="inherit" onClick={() => navigate('/rider')}>
            احجز رحلة
          </Button>
          <Button color="inherit" onClick={() => navigate('/driver')}>
            كن سائقاً
          </Button>
          {isAdmin && (
            <Button color="inherit" onClick={() => navigate('/admin')}>
              لوحة التحكم
            </Button>
          )}
        </Box>

        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { navigate('/'); handleClose(); }}>الرئيسية</MenuItem>
            <MenuItem onClick={() => { navigate('/rider'); handleClose(); }}>احجز رحلة</MenuItem>
            <MenuItem onClick={() => { navigate('/driver'); handleClose(); }}>كن سائقاً</MenuItem>
            {isAdmin && (
              <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>لوحة التحكم</MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
