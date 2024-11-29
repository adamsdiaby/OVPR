import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Badge,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationList = () => {
  const {
    notifications,
    removeNotification,
    markAsRead,
    markAllAsRead
  } = useNotification();

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <CheckIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const handleClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.actionLink) {
      // Naviguer vers le lien d'action si présent
      window.location.href = notification.actionLink;
    }
  };

  const renderNotification = (notification) => (
    <ListItem
      key={notification._id}
      button
      onClick={() => handleClick(notification)}
      sx={{
        opacity: notification.read ? 0.7 : 1,
        bgcolor: notification.read ? 'transparent' : 'action.hover'
      }}
    >
      <ListItemIcon>
        {getNotificationIcon(notification.type, notification.priority)}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Typography
            variant="subtitle2"
            component="div"
            sx={{
              fontWeight: notification.read ? 'normal' : 'bold'
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
              sx={{ display: 'block', mt: 0.5 }}
            >
              {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
            </Typography>
          </Box>
        }
      />

      <ListItemSecondaryAction>
        <Tooltip title="Supprimer">
          <IconButton
            edge="end"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification._id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="primary">
            <NotificationIcon />
          </Badge>
          <Typography variant="h6">
            Notifications
          </Typography>
        </Box>
        
        {unreadCount > 0 && (
          <Tooltip title="Marquer tout comme lu">
            <IconButton onClick={markAllAsRead} size="small">
              <CheckIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {notifications.length > 0 ? (
        <List sx={{ width: '100%', maxWidth: 360 }}>
          {notifications.map(renderNotification)}
        </List>
      ) : (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary'
          }}
        >
          <Typography variant="body2">
            Aucune notification
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NotificationList;
