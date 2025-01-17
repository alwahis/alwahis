import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import RideCard from '../components/RideCard';
import { ridesService } from '../services/ridesService';
import { requestsService } from '../services/requestsService';
import { useAuth } from '../context/AuthContext';

const PublishedRides = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const { data, error } = await ridesService.getPublishedRides();
      if (error) throw error;
      setRides(data);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRide = (ride) => {
    if (!user) {
      // Handle authentication required
      return;
    }
    setSelectedRide(ride);
    setOpenRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!user || !selectedRide) return;

    setRequesting(true);
    setError('');

    try {
      const requestData = {
        ride_id: selectedRide.id,
        user_id: user.id,
        seats_requested: seatsRequested,
      };

      const { error } = await requestsService.createRequest(requestData);
      if (error) throw error;

      setOpenRequestDialog(false);
      // Optionally show success message
    } catch (error) {
      setError('حدث خطأ في إرسال الطلب');
      console.error('Error creating request:', error);
    } finally {
      setRequesting(false);
    }
  };

  const filteredRides = rides.filter((ride) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ride.from_location.toLowerCase().includes(searchLower) ||
      ride.to_location.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          الرحلات المتاحة
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="ابحث عن رحلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {filteredRides.length > 0 ? (
            filteredRides.map((ride) => (
              <Grid item xs={12} key={ride.id}>
                <RideCard
                  ride={ride}
                  onRequest={handleRequestRide}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                لا توجد رحلات متاحة حالياً
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <Dialog
        open={openRequestDialog}
        onClose={() => setOpenRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>طلب حجز مقاعد</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="عدد المقاعد"
              type="number"
              value={seatsRequested}
              onChange={(e) => setSeatsRequested(parseInt(e.target.value))}
              inputProps={{ min: 1, max: selectedRide?.seats_available }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmitRequest}
            variant="contained"
            disabled={requesting}
          >
            {requesting ? <CircularProgress size={24} /> : 'تأكيد الطلب'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublishedRides;
