import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Tooltip,
  Divider
} from '@mui/material';
import {
  PushPin as PinIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PinnedMessages = ({ messages, onUnpin }) => {
  if (!messages || messages.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <PinIcon sx={{ mb: 1 }} />
        <Typography variant="body2">
          Aucun message épinglé
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          Messages épinglés ({messages.length})
        </Typography>
      </Box>
      
      <List dense>
        {messages.map((message) => (
          <React.Fragment key={message._id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {message.user.nom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(message.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </Typography>
                  </Box>
                }
                secondary={message.content}
                secondaryTypographyProps={{
                  sx: {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }
                }}
              />
              
              <ListItemSecondaryAction>
                <Tooltip title="Désépingler">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onUnpin(message._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default PinnedMessages;
