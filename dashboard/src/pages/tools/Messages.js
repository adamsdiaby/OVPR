import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout/SharedLayout';

const MessagesContent = () => {
  const [messages] = useState([
    {
      id: 1,
      sender: 'John Doe',
      subject: 'Question sur la vérification',
      content: 'Bonjour, j\'ai une question concernant le processus de vérification...',
      date: '2024-01-15',
      read: true
    },
    {
      id: 2,
      sender: 'Marie Martin',
      subject: 'Problème technique',
      content: 'Je rencontre un problème lors de la soumission de mon dossier...',
      date: '2024-01-14',
      read: false
    },
    {
      id: 3,
      sender: 'Pierre Dubois',
      subject: 'Demande d\'information',
      content: 'Pourriez-vous me donner plus d\'informations sur...',
      date: '2024-01-13',
      read: true
    }
  ]);

  const handleDelete = (id) => {
    console.log('Supprimer le message:', id);
  };

  const handleReply = (id) => {
    console.log('Répondre au message:', id);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      aria-label="reply"
                      onClick={() => handleReply(message.id)}
                      sx={{ mr: 1 }}
                    >
                      <ReplyIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDelete(message.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar>{message.sender[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography component="span" variant="subtitle1">
                        {message.subject}
                      </Typography>
                      {!message.read && (
                        <Chip 
                          label="Nouveau" 
                          size="small" 
                          color="primary"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {message.sender}
                      </Typography>
                      {" — "}{message.content}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {new Date(message.date).toLocaleDateString()}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < messages.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

const Messages = () => {
  return (
    <SharedLayout>
      <MessagesContent />
    </SharedLayout>
  );
};

export default Messages;
