import React, { useEffect, useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Load initial notifications
    loadNotifications();

    // Subscribe to new ride requests
    const rideRequestsSubscription = supabase
      .channel('ride_requests_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          handleNewNotification(payload.new);
        }
      )
      .subscribe();

    // Subscribe to request status changes
    const requestStatusSubscription = supabase
      .channel('request_status_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          handleStatusChange(payload.new);
        }
      )
      .subscribe();

    return () => {
      rideRequestsSubscription.unsubscribe();
      requestStatusSubscription.unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleStatusChange = (updatedRequest) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === updatedRequest.id ? { ...n, status: updatedRequest.status } : n
      )
    );
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const formatNotification = (notification) => {
    switch (notification.type) {
      case 'new_request':
        return `طلب حجز جديد للرحلة من ${notification.data.departure_city} إلى ${notification.data.destination_city}`;
      case 'request_accepted':
        return 'تم قبول طلب حجزك';
      case 'request_rejected':
        return 'تم رفض طلب حجزك';
      default:
        return notification.message;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '300px',
          },
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => {
                markAsRead(notification.id);
                handleClose();
              }}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
              }}
            >
              <ListItemText
                primary={formatNotification(notification)}
                secondary={new Date(notification.created_at).toLocaleString('ar-SA')}
              />
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              لا توجد إشعارات
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
