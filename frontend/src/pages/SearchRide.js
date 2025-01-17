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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { ridesService } from '../services/ridesService';
import { rideRequestsService } from '../services/rideRequestsService';
import { format } from 'date-fns';

const SearchRide = () => {
  const [searchParams, setSearchParams] = useState({
    departure_city: '',
    destination_city: '',
    date: null,
    min_price: '',
    max_price: '',
    departure_time_start: null,
    departure_time_end: null,
    min_available_seats: '',
    sort_by: 'departure_time',
    sort_order: 'asc',
    page: 1,
    per_page: 10
  });
  
  const [rides, setRides] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      if (!searchParams.departure_city || !searchParams.destination_city) {
        setError('الرجاء إدخال مكان الانطلاق والوجهة');
        return;
      }

      const searchData = {
        ...searchParams,
        page,
        date: searchParams.date ? format(searchParams.date, 'yyyy-MM-dd') : null,
        departure_time_start: searchParams.departure_time_start ? format(searchParams.departure_time_start, 'HH:mm') : null,
        departure_time_end: searchParams.departure_time_end ? format(searchParams.departure_time_end, 'HH:mm') : null,
      };

      console.log('Search params:', searchData);
      const { data, error } = await ridesService.searchRides(searchData);
      console.log('Search result:', { data, error });
      
      if (error) {
        console.error('Search error:', error);
        setError(typeof error === 'string' ? error : 'حدث خطأ أثناء البحث عن الرحلات');
        return;
      }

      setRides(data.rides || []);
      setPagination({
        current_page: data.pagination.current_page,
        total_pages: data.pagination.total_pages,
        total_items: data.pagination.total_items
      });
      setSearchPerformed(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('حدث خطأ أثناء البحث عن الرحلات');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setSearchParams(prev => ({ ...prev, page: value }));
    handleSearch(value);
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
              value={searchParams.departure_city}
              onChange={(e) => setSearchParams({ ...searchParams, departure_city: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="إلى"
              value={searchParams.destination_city}
              onChange={(e) => setSearchParams({ ...searchParams, destination_city: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="التاريخ"
                value={searchParams.date}
                onChange={(date) => setSearchParams({ ...searchParams, date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="الحد الأدنى للمقاعد المتاحة"
              value={searchParams.min_available_seats}
              onChange={(e) => setSearchParams({ ...searchParams, min_available_seats: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="السعر الأدنى"
              value={searchParams.min_price}
              onChange={(e) => setSearchParams({ ...searchParams, min_price: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="السعر الأعلى"
              value={searchParams.max_price}
              onChange={(e) => setSearchParams({ ...searchParams, max_price: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="وقت المغادرة (من)"
                value={searchParams.departure_time_start}
                onChange={(time) => setSearchParams({ ...searchParams, departure_time_start: time })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="وقت المغادرة (إلى)"
                value={searchParams.departure_time_end}
                onChange={(time) => setSearchParams({ ...searchParams, departure_time_end: time })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>ترتيب حسب</InputLabel>
              <Select
                value={searchParams.sort_by}
                label="ترتيب حسب"
                onChange={(e) => setSearchParams({ ...searchParams, sort_by: e.target.value })}
              >
                <MenuItem value="price">السعر</MenuItem>
                <MenuItem value="departure_time">وقت المغادرة</MenuItem>
                <MenuItem value="available_seats">المقاعد المتاحة</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>اتجاه الترتيب</InputLabel>
              <Select
                value={searchParams.sort_order}
                label="اتجاه الترتيب"
                onChange={(e) => setSearchParams({ ...searchParams, sort_order: e.target.value })}
              >
                <MenuItem value="asc">تصاعدي</MenuItem>
                <MenuItem value="desc">تنازلي</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            onClick={() => handleSearch(1)}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {searchPerformed && rides.length === 0 && !loading && (
          <Alert severity="info">لم يتم العثور على رحلات متطابقة</Alert>
        )}

        {rides.map((ride) => (
          <Card key={ride.id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">
                    {ride.departure_city} → {ride.destination_city}
                  </Typography>
                  <Typography color="textSecondary">
                    التاريخ: {new Date(ride.departure_time).toLocaleDateString()}
                  </Typography>
                  <Typography color="textSecondary">
                    الوقت: {new Date(ride.departure_time).toLocaleTimeString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>السعر: {ride.price_per_seat} دينار</Typography>
                  <Typography>المقاعد المتاحة: {ride.available_seats}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<WhatsAppIcon />}
                    href={`https://wa.me/${ride.driver_phone}`}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    تواصل مع السائق
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        {rides.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.total_pages}
              page={pagination.current_page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}

        <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)}>
          <DialogTitle>طلب رحلة</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="رقم الواتساب"
              type="text"
              fullWidth
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRequestDialog(false)}>إلغاء</Button>
            <Button onClick={handleRequestRide} disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default SearchRide;
