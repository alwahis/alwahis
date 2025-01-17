import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { arSA } from 'date-fns/locale';
import RideCard from '../components/RideCard';
import { ridesService } from '../services/ridesService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SearchRide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: null,
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await ridesService.searchRides(searchParams);
      if (error) throw error;
      setRides(data);
      setSearched(true);
    } catch (error) {
      console.error('Error searching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRide = (ride) => {
    if (!user) {
      navigate('/login', { state: { from: '/search' } });
      return;
    }
    // Navigate to request page or open modal
    // This will be implemented later
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          البحث عن رحلة
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="من"
                  value={searchParams.from}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, from: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="إلى"
                  value={searchParams.to}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, to: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
                  <DateTimePicker
                    label="تاريخ الرحلة"
                    value={searchParams.date}
                    onChange={(newValue) =>
                      setSearchParams({ ...searchParams, date: newValue })
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'بحث'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {searched && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {rides.length > 0
                ? `تم العثور على ${rides.length} رحلات`
                : 'لم يتم العثور على رحلات'}
            </Typography>
            {rides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onRequest={handleRequestRide}
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SearchRide;
