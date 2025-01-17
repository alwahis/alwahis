import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://alwahis-backend.onrender.com';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: 'Noto Kufi Arabic, sans-serif',
}));

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({
    totalRides: 0,
    activeRides: 0,
    completedRides: 0
  });
  const [pollingInterval, setPollingInterval] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        startPolling();
      } else {
        alert('خطأ في تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('حدث خطأ في تسجيل الدخول');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    stopPolling();
  };

  const loadRides = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/rides`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRides(data.rides || []);
      } else if (response.status === 401) {
        logout();
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    }
  };

  const updateStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        logout();
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const deleteRide = async (rideId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرحلة؟')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/rides/${rideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadRides();
        updateStats();
      } else if (response.status === 401) {
        logout();
      } else {
        alert('فشل حذف الرحلة');
      }
    } catch (error) {
      console.error('Error deleting ride:', error);
      alert('حدث خطأ في حذف الرحلة');
    }
  };

  const startPolling = () => {
    loadRides();
    updateStats();
    const interval = setInterval(() => {
      loadRides();
      updateStats();
    }, 30000);
    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      startPolling();
    }
    return () => stopPolling();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('ar-SA');
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            تسجيل الدخول للوحة التحكم
          </Typography>
          <Box component="form" onSubmit={login} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              type="password"
              label="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              تسجيل الدخول
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          لوحة التحكم
        </Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          تسجيل الخروج
        </Button>
      </Box>

      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          إحصائيات
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="subtitle1">إجمالي الرحلات</Typography>
            <Typography variant="h4">{stats.totalRides}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">الرحلات النشطة</Typography>
            <Typography variant="h4">{stats.activeRides}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">الرحلات المكتملة</Typography>
            <Typography variant="h4">{stats.completedRides}</Typography>
          </Box>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>رقم الرحلة</StyledTableCell>
              <StyledTableCell>من</StyledTableCell>
              <StyledTableCell>إلى</StyledTableCell>
              <StyledTableCell>التاريخ</StyledTableCell>
              <StyledTableCell>الحالة</StyledTableCell>
              <StyledTableCell>إجراءات</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rides.map((ride) => (
              <TableRow key={ride.id}>
                <StyledTableCell>{ride.id}</StyledTableCell>
                <StyledTableCell>{ride.from}</StyledTableCell>
                <StyledTableCell>{ride.to}</StyledTableCell>
                <StyledTableCell>{formatDate(ride.date)}</StyledTableCell>
                <StyledTableCell>{ride.status}</StyledTableCell>
                <StyledTableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => deleteRide(ride.id)}
                  >
                    حذف
                  </Button>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminPanel;
