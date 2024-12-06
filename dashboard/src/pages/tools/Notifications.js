import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout/SharedLayout';

const NotificationsContent = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: 'Nouvelle demande de vérification',
      message: 'Une nouvelle demande de vérification a été soumise par l\'utilisateur #12345',
      timestamp: '2024-01-15 10:30',
      status: 'urgent',
      read: false
    },
    {
      id: 2,
      title: 'Mise à jour système',
      message: 'Une mise à jour du système est prévue pour le 20 janvier 2024',
      timestamp: '2024-01-14 15:45',
      status: 'info',
      read: true
    },
    {
      id: 3,
      title: 'Rapport hebdomadaire',
      message: 'Le rapport hebdomadaire des activités est disponible',
      timestamp: '2024-01-13 09:15',
      status: 'success',
      read: false
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'urgent':
        return 'error';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleMarkAsRead = (id) => {
    console.log('Marquer comme lu:', id);
  };

  const handleDelete = (id) => {
    console.log('Supprimer la notification:', id);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover'
                }}
                secondaryAction={
                  <Box>
                    {!notification.read && (
                      <IconButton
                        edge="end"
                        aria-label="mark as read"
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{ mr: 1 }}
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.status}
                        color={getStatusColor(notification.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {notification.timestamp}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

const Notifications = () => {
  return (
    <SharedLayout>
      <NotificationsContent />
    </SharedLayout>
  );
};

export default Notifications;
