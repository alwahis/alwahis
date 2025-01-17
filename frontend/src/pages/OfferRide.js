import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { arSA } from 'date-fns/locale';
import { ridesService } from '../services/ridesService';

function OfferRide() {
  const [rideData, setRideData] = useState({
    from: '',
    to: '',
    date: null,
    seats: '',
    price: '',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await ridesService.createRide(rideData);
      if (error) throw error;
      // Reset form and show success message
      setRideData({
        from: '',
        to: '',
        date: null,
        seats: '',
        price: '',
        notes: '',
      });
      alert('تم إضافة الرحلة بنجاح');
    } catch (error) {
      console.error('Error creating ride:', error);
      alert('حدث خطأ أثناء إضافة الرحلة');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          عرض رحلة جديدة
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="من"
                value={rideData.from}
                onChange={(e) => setRideData({ ...rideData, from: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="إلى"
                value={rideData.to}
                onChange={(e) => setRideData({ ...rideData, to: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
                <DateTimePicker
                  label="موعد الرحلة"
                  value={rideData.date}
                  onChange={(newValue) => setRideData({ ...rideData, date: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="عدد المقاعد"
                type="number"
                value={rideData.seats}
                onChange={(e) => setRideData({ ...rideData, seats: e.target.value })}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="السعر لكل راكب"
                type="number"
                value={rideData.price}
                onChange={(e) => setRideData({ ...rideData, price: e.target.value })}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ملاحظات إضافية"
                multiline
                rows={4}
                value={rideData.notes}
                onChange={(e) => setRideData({ ...rideData, notes: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                عرض الرحلة
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default OfferRide;
