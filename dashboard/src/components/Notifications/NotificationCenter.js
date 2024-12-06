import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  Warning as AlertIcon,
  CheckCircle as ValidateIcon,
  Block as RejectIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { createApiClient } from '../../config/api';

const NotificationCenter = ({ onNotificationClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const fetchNotifications = useCallback(async () => {
    if (loading) return; // Éviter les appels multiples
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return; // Ne pas faire l'appel si pas de token
      
      const apiClient = createApiClient(token);
      const response = await apiClient.get('/admin/notifications');
      setNotifications(response.notifications || []);
      setUnreadCount((response.notifications || []).filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    let interval;
    
    // Première récupération
    fetchNotifications();
    
    // Mettre en place l'intervalle seulement si le composant est monté
    interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 secondes
    
    // Nettoyer l'intervalle lors du démontage
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchNotifications]); // Ajout de fetchNotifications dans les dépendances useEffect

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Marquer comme lu
      const token = localStorage.getItem('token');
      const apiClient = createApiClient(token);
      await apiClient.put(`/admin/notifications/${notification._id}/read`);
      
      // Mettre à jour l'interface
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Fermer le menu
      handleClose();

      // Rediriger vers la page appropriée
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiClient = createApiClient(token);
      await apiClient.put('/admin/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admin_validation':
        return <AdminIcon color="primary" />;
      case 'alert':
        return <AlertIcon color="error" />;
      case 'validation':
        return <ValidateIcon color="success" />;
      case 'rejection':
        return <RejectIcon color="error" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'admin_validation':
        return theme.palette.primary.main;
      case 'alert':
        return theme.palette.error.main;
      case 'validation':
        return theme.palette.success.main;
      case 'rejection':
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours < 24) {
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleClearAll}
              startIcon={<DeleteIcon />}
            >
              Tout marquer comme lu
            </Button>
          )}
        </Box>
        
        <Divider />
        
        <List sx={{ p: 0 }}>
          {loading ? (
            <ListItem>
              <ListItemText
                primary="Chargement..."
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          ) : notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Aucune notification"
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: getNotificationColor(notification.type),
                          fontWeight: notification.read ? 'normal' : 'bold',
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationCenter;
