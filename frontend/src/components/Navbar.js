import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';

function Navbar() {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            عالواهس
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/search"
              startIcon={<SearchIcon />}
            >
              ابحث عن رحلة
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/offer"
              startIcon={<DirectionsCarIcon />}
            >
              اعرض رحلة
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/my-rides"
            >
              رحلاتي
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/profile"
              startIcon={<PersonIcon />}
            >
              الملف الشخصي
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
