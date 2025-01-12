import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import PersonIcon from '@mui/icons-material/Person';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          مرحباً بك في الوحيس
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          خدمة التوصيل الأولى في العراق
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <PersonIcon sx={{ fontSize: 60, color: '#FF8C00', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                هل تريد رحلة؟
              </Typography>
              <Typography paragraph>
                احجز رحلتك الآن بكل سهولة وأمان
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/rider')}
                sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
              >
                احجز رحلة
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <LocalTaxiIcon sx={{ fontSize: 60, color: '#FF8C00', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                هل تريد أن تكون سائقاً؟
              </Typography>
              <Typography paragraph>
                انضم إلى فريقنا وابدأ في كسب المال
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/driver')}
                sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
              >
                سجل كسائق
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
