import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { LocalTaxi as LocalTaxiIcon } from '@mui/icons-material';

const RiderDashboard = () => {
  const [rideDetails, setRideDetails] = useState({
    pickup: '',
    destination: '',
    passengers: '1',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleChange = (e) => {
    setRideDetails({
      ...rideDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here we'll integrate with backend API
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotification({
        open: true,
        message: 'تم تقديم طلب رحلتك بنجاح!',
        severity: 'success',
      });
      
      // Clear form
      setRideDetails({
        pickup: '',
        destination: '',
        passengers: '1',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'حدث خطأ أثناء تقديم طلبك',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          احجز رحلتك
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="موقع الانطلاق"
                  name="pickup"
                  value={rideDetails.pickup}
                  onChange={handleChange}
                  required
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="الوجهة"
                  name="destination"
                  value={rideDetails.destination}
                  onChange={handleChange}
                  required
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="عدد الركاب"
                  name="passengers"
                  type="number"
                  value={rideDetails.passengers}
                  onChange={handleChange}
                  required
                  inputProps={{ min: "1", max: "4" }}
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LocalTaxiIcon />}
                  sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
                >
                  {loading ? 'جاري البحث عن سائق...' : 'اطلب رحلة'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RiderDashboard;
