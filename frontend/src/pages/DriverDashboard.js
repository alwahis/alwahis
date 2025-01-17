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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DriveEta as DriveEtaIcon } from '@mui/icons-material';

const DriverDashboard = () => {
  const [driverDetails, setDriverDetails] = useState({
    carModel: '',
    licensePlate: '',
    phoneNumber: '',
    available: true,
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDriverDetails({
      ...driverDetails,
      [e.target.name]: value,
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
        message: 'تم تسجيلك كسائق بنجاح!',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'حدث خطأ أثناء التسجيل',
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
          انضم كسائق
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="موديل السيارة"
                  name="carModel"
                  value={driverDetails.carModel}
                  onChange={handleChange}
                  required
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="رقم اللوحة"
                  name="licensePlate"
                  value={driverDetails.licensePlate}
                  onChange={handleChange}
                  required
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="رقم الهاتف"
                  name="phoneNumber"
                  value={driverDetails.phoneNumber}
                  onChange={handleChange}
                  required
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={driverDetails.available}
                      onChange={handleChange}
                      name="available"
                      color="primary"
                    />
                  }
                  label="متاح للعمل"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <DriveEtaIcon />}
                  sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
                >
                  {loading ? 'جاري التسجيل...' : 'سجل كسائق'}
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

export default DriverDashboard;
