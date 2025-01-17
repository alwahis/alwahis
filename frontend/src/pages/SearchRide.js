import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { ridesService } from '../services/ridesService';
import { rideRequestsService } from '../services/rideRequestsService';

const SearchRide = () => {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: null,
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Search params:', searchParams);
      const { data, error } = await ridesService.searchRides(searchParams);
      console.log('Search result:', { data, error });
      if (error) throw error;
      setRides(data || []);
      setSearchPerformed(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('حدث خطأ أثناء البحث عن الرحلات');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRide = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await rideRequestsService.createRideRequest({
        ...searchParams,
        whatsappNumber,
      });
      if (error) throw error;
      setOpenRequestDialog(false);
      setWhatsappNumber('');
      alert('تم إنشاء طلب الرحلة بنجاح');
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء طلب الرحلة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ابحث عن رحلة
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="من"
              value={searchParams.from}
              onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="إلى"
              value={searchParams.to}
              onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="التاريخ"
                value={searchParams.date}
                onChange={(date) => setSearchParams({ ...searchParams, date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSearch}
              disabled={loading}
            >
              بحث
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {searchPerformed && rides.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              لم نجد رحلات متطابقة مع بحثك
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenRequestDialog(true)}
              sx={{ mt: 2 }}
            >
              اقترح رحلة جديدة
            </Button>
          </Box>
        )}

        {rides.map((ride) => (
          <Card key={ride.id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">
                    {ride.from_location} → {ride.to_location}
                  </Typography>
                  <Typography color="textSecondary">
                    {new Date(ride.departure_time).toLocaleDateString('ar-IQ')}
                  </Typography>
                  <Typography>
                    السعر: {ride.price_per_seat} دينار
                  </Typography>
                  <Typography>
                    المقاعد المتاحة: {ride.available_seats}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    href={`https://wa.me/${ride.whatsapp_number}`}
                    target="_blank"
                  >
                    تواصل عبر واتساب
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)}>
        <DialogTitle>اقترح رحلة جديدة</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="رقم الواتساب"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="مثال: 9647801234567"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>إلغاء</Button>
          <Button onClick={handleRequestRide} variant="contained" disabled={loading}>
            إرسال
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SearchRide;
