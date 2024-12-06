import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  EmojiEmotions as EmojiIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import API_ENDPOINTS, { createApiClient } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const { user } = useAuth();
  const apiClient = createApiClient(localStorage.getItem('token'));

  useEffect(() => {
    fetchMessages();
    initializeWebSocket();
    fetchOnlineAdmins();

    const interval = setInterval(fetchOnlineAdmins, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.ADMIN_CHAT);
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const fetchOnlineAdmins = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.ADMIN_ONLINE);
      setOnlineAdmins(data);
    } catch (error) {
      console.error('Erreur lors du chargement des admins en ligne:', error);
    }
  };

  const initializeWebSocket = () => {
    const ws = new WebSocket(API_ENDPOINTS.ADMIN_CHAT_WEBSOCKET);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };

    return () => {
      ws.close();
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = {
        content: newMessage.trim(),
        senderId: user._id,
        timestamp: new Date().toISOString()
      };

      await apiClient.post(API_ENDPOINTS.ADMIN_CHAT, message);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper 
      sx={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper
      }}
    >
      {/* En-tête */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AdminIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6">
            Chat Administrateurs
          </Typography>
          <Badge
            badgeContent={onlineAdmins.length}
            color="success"
            sx={{ ml: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              En ligne
            </Typography>
          </Badge>
        </Box>
        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Archiver la conversation</MenuItem>
          <MenuItem onClick={handleMenuClose}>Exporter les messages</MenuItem>
          <MenuItem onClick={handleMenuClose}>Paramètres</MenuItem>
        </Menu>
      </Box>

      {/* Liste des messages */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: theme.palette.background.default
        }}
      >
        {messages.map((message, index) => (
          <React.Fragment key={message._id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                flexDirection: message.senderId === user._id ? 'row-reverse' : 'row',
                mb: 2
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: message.senderId === user._id ? 
                      theme.palette.primary.main : 
                      theme.palette.secondary.main
                  }}
                >
                  {message.sender.nom[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.senderId === user._id ? 'flex-end' : 'flex-start',
                      alignItems: 'center',
                      mb: 0.5
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      {message.sender.nom} {message.sender.prenom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      backgroundColor: message.senderId === user._id ? 
                        theme.palette.primary.light : 
                        theme.palette.grey[100],
                      color: message.senderId === user._id ? 
                        theme.palette.primary.contrastText : 
                        'inherit',
                      borderRadius: 2,
                      maxWidth: '80%',
                      ml: message.senderId === user._id ? 'auto' : 0
                    }}
                  >
                    <Typography variant="body1">
                      {message.content}
                    </Typography>
                  </Paper>
                }
              />
            </ListItem>
            {index < messages.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </List>

      {/* Zone de saisie */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small">
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            variant="outlined"
            size="small"
          />
          <IconButton size="small">
            <EmojiIcon />
          </IconButton>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Envoyer
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AdminChat;
