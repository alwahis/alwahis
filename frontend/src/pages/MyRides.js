import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { arSA } from 'date-fns/locale';
import RideCard from '../components/RideCard';
import { ridesService } from '../services/ridesService';
import { useAuth } from '../context/AuthContext';

const MyRides = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewRide, setOpenNewRide] = useState(false);
  const [newRide, setNewRide] = useState({
    from_location: '',
    to_location: '',
    departure_date: null,
    seats_available: '',
    price: '',
  });

  useEffect(() => {
    loadRides();
  }, [user]);

  const loadRides = async () => {
    try {
      const { data, error } = await ridesService.getUserRides(user.id);
      if (error) throw error;
      setRides(data);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRide = async () => {
    try {
      const rideData = {
        ...newRide,
        user_id: user.id,
        status: 'published',
      };

      const { error } = await ridesService.createRide(rideData);
      if (error) throw error;

      setOpenNewRide(false);
      loadRides();
    } catch (error) {
      console.error('Error creating ride:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const filteredRides = rides.filter((ride) => {
    if (tab === 0) return ride.status === 'published';
    if (tab === 1) return ride.status === 'completed';
    return ride.status === 'cancelled';
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            رحلاتي
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpenNewRide(true)}
          >
            إنشاء رحلة جديدة
          </Button>
        </Box>

        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="الرحلات النشطة" />
          <Tab label="الرحلات المكتملة" />
          <Tab label="الرحلات الملغاة" />
        </Tabs>

        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              showDriverInfo={false}
            />
          ))
        ) : (
          <Typography align="center" color="text.secondary">
            لا توجد رحلات في هذه القائمة
          </Typography>
        )}
      </Box>

      <Dialog open={openNewRide} onClose={() => setOpenNewRide(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إنشاء رحلة جديدة</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="من"
                value={newRide.from_location}
                onChange={(e) =>
                  setNewRide({ ...newRide, from_location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="إلى"
                value={newRide.to_location}
                onChange={(e) =>
                  setNewRide({ ...newRide, to_location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
                <DateTimePicker
                  label="تاريخ الرحلة"
                  value={newRide.departure_date}
                  onChange={(newValue) =>
                    setNewRide({ ...newRide, departure_date: newValue })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="عدد المقاعد"
                type="number"
                value={newRide.seats_available}
                onChange={(e) =>
                  setNewRide({ ...newRide, seats_available: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="السعر"
                type="number"
                value={newRide.price}
                onChange={(e) =>
                  setNewRide({ ...newRide, price: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewRide(false)}>إلغاء</Button>
          <Button onClick={handleCreateRide} variant="contained">
            إنشاء
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyRides;
