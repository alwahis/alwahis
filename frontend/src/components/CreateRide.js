import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Grid
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { arSD } from 'date-fns/locale';

const CreateRide = () => {
  const [rideData, setRideData] = useState({
    departure_city: '',
    destination_city: '',
    departure_time: null,
    total_seats: '',
    price_per_seat: '',
    car_type: '',
    car_details: '',
    photo: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call to create ride will be implemented here
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom align="right">
        إنشاء رحلة جديدة
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="مدينة المغادرة"
              value={rideData.departure_city}
              onChange={(e) => setRideData({...rideData, departure_city: e.target.value})}
              required
              dir="rtl"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="مدينة الوصول"
              value={rideData.destination_city}
              onChange={(e) => setRideData({...rideData, destination_city: e.target.value})}
              required
              dir="rtl"
            />
          </Grid>

          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSD}>
              <DateTimePicker
                label="وقت المغادرة"
                value={rideData.departure_time}
                onChange={(newValue) => setRideData({...rideData, departure_time: newValue})}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="عدد المقاعد"
              type="number"
              value={rideData.total_seats}
              onChange={(e) => setRideData({...rideData, total_seats: e.target.value})}
              required
              dir="rtl"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="السعر لكل مقعد (دينار عراقي)"
              type="number"
              value={rideData.price_per_seat}
              onChange={(e) => setRideData({...rideData, price_per_seat: e.target.value})}
              required
              dir="rtl"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="نوع السيارة"
              value={rideData.car_type}
              onChange={(e) => setRideData({...rideData, car_type: e.target.value})}
              required
              dir="rtl"
            >
              <MenuItem value="SUV">دفع رباعي</MenuItem>
              <MenuItem value="Sedan">صالون</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="تفاصيل السيارة"
              multiline
              rows={2}
              value={rideData.car_details}
              onChange={(e) => setRideData({...rideData, car_details: e.target.value})}
              required
              dir="rtl"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
            >
              تحميل صورة السيارة
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setRideData({...rideData, photo: e.target.files[0]})}
              />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
            >
              نشر الرحلة
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateRide;
