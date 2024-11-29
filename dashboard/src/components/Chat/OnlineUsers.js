import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useChat } from '../../contexts/ChatContext';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const OnlineUsers = () => {
  const { onlineUsers, isUserOnline } = useChat();

  return (
    <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Utilisateurs en ligne ({onlineUsers.size})
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ overflow: 'auto', maxHeight: 400 }}>
        {Array.from(onlineUsers).map((user) => (
          <ListItem key={user._id}>
            <ListItemAvatar>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <Avatar alt={user.nom} src={user.avatar}>
                  {user.nom[0]}
                </Avatar>
              </StyledBadge>
            </ListItemAvatar>
            <ListItemText
              primary={`${user.nom} ${user.prenom}`}
              secondary={
                <Tooltip title={`En ligne depuis ${user.lastLoginTime}`}>
                  <Typography variant="caption" color="textSecondary">
                    {user.role}
                  </Typography>
                </Tooltip>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default OnlineUsers;
