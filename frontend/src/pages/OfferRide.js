import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { ridesService } from '../services/ridesService';
import { rideRequestsService } from '../services/rideRequestsService';

const OfferRide = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [rideData, setRideData] = useState({
    from: '',
    to: '',
    date: null,
    seats: '',
    price: '',
    whatsappNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);

  useEffect(() => {
    fetchRideRequests();
  }, []);

  const fetchRideRequests = async () => {
    try {
      const { data, error } = await rideRequestsService.getRideRequests();
      if (error) throw error;
      setRideRequests(data || []);
    } catch (err) {
      console.error('Error fetching ride requests:', err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await ridesService.createRide(rideData);
      if (error) throw error;
      alert('تم نشر الرحلة بنجاح');
      setRideData({
        from: '',
        to: '',
        date: null,
        seats: '',
        price: '',
        whatsappNumber: '',
      });
    } catch (err) {
      setError('حدث خطأ أثناء نشر الرحلة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          نشر وإدارة الرحلات
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="نشر رحلة" />
          <Tab label="طلبات الرحلات" />
        </Tabs>

        {activeTab === 0 ? (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="من"
                  value={rideData.from}
                  onChange={(e) => setRideData({ ...rideData, from: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="إلى"
                  value={rideData.to}
                  onChange={(e) => setRideData({ ...rideData, to: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="تاريخ الرحلة"
                    value={rideData.date}
                    onChange={(date) => setRideData({ ...rideData, date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="عدد المقاعد المتاحة"
                  type="number"
                  value={rideData.seats}
                  onChange={(e) => setRideData({ ...rideData, seats: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="السعر لكل مقعد"
                  type="number"
                  value={rideData.price}
                  onChange={(e) => setRideData({ ...rideData, price: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="رقم الواتساب"
                  value={rideData.whatsappNumber}
                  onChange={(e) => setRideData({ ...rideData, whatsappNumber: e.target.value })}
                  placeholder="مثال: 9647801234567"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  نشر الرحلة
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              طلبات الرحلات المفتوحة
            </Typography>
            {rideRequests.map((request) => (
              <Card key={request.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6">
                        {request.departure_city} → {request.destination_city}
                      </Typography>
                      <Typography color="textSecondary">
                        {new Date(request.preferred_date).toLocaleDateString('ar-IQ')}
                      </Typography>
                      <Typography color="textSecondary">
                        تم النشر: {new Date(request.created_at).toLocaleDateString('ar-IQ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<WhatsAppIcon />}
                        href={`https://wa.me/${request.whatsapp_number}`}
                        target="_blank"
                      >
                        تواصل عبر واتساب
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            {rideRequests.length === 0 && (
              <Typography color="textSecondary" align="center">
                لا توجد طلبات رحلات حالياً
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default OfferRide;
