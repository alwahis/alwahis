import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import {
  DirectionsCar,
  EventSeat,
  AttachMoney,
  Schedule,
} from '@mui/icons-material';

const RideCard = ({ ride, onRequest, showDriverInfo = true }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    published: 'success',
    pending: 'warning',
    completed: 'info',
    cancelled: 'error',
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={showDriverInfo ? 8 : 12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DirectionsCar sx={{ mr: 1 }} />
              <Typography variant="h6">
                {ride.from_location} → {ride.to_location}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {formatDate(ride.departure_date)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventSeat sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {ride.seats_available} مقاعد متاحة
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {ride.price} ريال
                </Typography>
              </Box>
            </Box>

            <Chip
              label={ride.status === 'published' ? 'متاح' : ride.status}
              color={statusColors[ride.status]}
              size="small"
            />
          </Grid>

          {showDriverInfo && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={ride.driver?.avatar_url}
                  sx={{ width: 64, height: 64, mb: 1 }}
                />
                <Typography variant="subtitle1" gutterBottom>
                  {ride.driver?.full_name}
                </Typography>
                {onRequest && ride.status === 'published' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onRequest(ride)}
                    fullWidth
                  >
                    طلب حجز
                  </Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RideCard;
