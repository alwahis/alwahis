import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Notifications from './Notifications';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleMobileMenu = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
    navigate('/login');
  };

  const menuItems = [
    { label: 'الرئيسية', path: '/' },
    { label: 'البحث عن رحلة', path: '/search' },
    { label: 'الرحلات المنشورة', path: '/published-rides' },
  ];

  const authenticatedItems = [
    { label: 'رحلاتي', path: '/my-rides' },
    { label: 'الملف الشخصي', path: '/profile' },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ display: { sm: 'none' } }}
            onClick={handleMobileMenu}
          >
            <MenuIcon />
          </IconButton>

          <DirectionsCarIcon sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            الوحيس
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{ color: 'white', display: 'block', mx: 1 }}
              >
                {item.label}
              </Button>
            ))}
            {user && authenticatedItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{ color: 'white', display: 'block', mx: 1 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {user && <Notifications />}
            {user ? (
              <>
                <IconButton onClick={handleMenu} sx={{ p: 0, ml: 2 }}>
                  <Avatar alt={user.email} src={user.user_metadata?.avatar_url} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    الملف الشخصي
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>تسجيل الخروج</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/login"
              >
                تسجيل الدخول
              </Button>
            )}
          </Box>
        </Toolbar>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleClose}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleClose}
            >
              {item.label}
            </MenuItem>
          ))}
          {user && authenticatedItems.map((item) => (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleClose}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Container>
    </AppBar>
  );
};

export default Navigation;
