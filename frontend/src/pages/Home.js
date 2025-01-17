import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          مرحباً بك في الوحيس
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          منصة مشاركة الرحلات الأولى في العراق
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <SearchIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                ابحث عن رحلة
              </Typography>
              <Typography paragraph>
                ابحث عن رحلات متاحة واحجز مقعدك بكل سهولة وأمان
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/search')}
              >
                ابحث الآن
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                انشر رحلتك
              </Typography>
              <Typography paragraph>
                شارك رحلتك مع الآخرين وساعد في تقليل التكاليف
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/offer')}
              >
                انشر الآن
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
