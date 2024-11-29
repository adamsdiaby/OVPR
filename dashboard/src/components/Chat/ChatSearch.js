import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ChatSearch = ({ open, onClose, messages, onMessageSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);

  // Extraire les utilisateurs uniques et les tags des messages
  const uniqueUsers = [...new Set(messages.map(msg => msg.sender.nom))];
  const uniqueTags = [...new Set(messages.flatMap(msg => msg.tags || []))];

  useEffect(() => {
    const filtered = messages.filter(msg => {
      const matchesQuery = searchQuery
        ? msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesDateRange = (!startDate || new Date(msg.createdAt) >= startDate) &&
        (!endDate || new Date(msg.createdAt) <= endDate);

      const matchesUser = !selectedUser || msg.sender.nom === selectedUser;

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => msg.tags?.includes(tag));

      return matchesQuery && matchesDateRange && matchesUser && matchesTags;
    });

    setFilteredMessages(filtered);
  }, [searchQuery, startDate, endDate, selectedUser, selectedTags, messages]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>
        Rechercher dans l'historique
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher un message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            label="Date de début"
            value={startDate}
            onChange={setStartDate}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="Date de fin"
            value={endDate}
            onChange={setEndDate}
            renderInput={(params) => <TextField {...params} />}
          />
          <TextField
            select
            label="Utilisateur"
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value || null)}
            SelectProps={{ native: true }}
            sx={{ minWidth: 200 }}
          >
            <option value="">Tous les utilisateurs</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {uniqueTags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleTagToggle(tag)}
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
            />
          ))}
        </Box>

        <List sx={{ flex: 1, overflow: 'auto' }}>
          {filteredMessages.map((message) => (
            <ListItem
              key={message._id}
              button
              onClick={() => {
                onMessageSelect(message);
                onClose();
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">
                      {message.sender.nom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {message.content}
                    </Typography>
                    {message.tags && message.tags.length > 0 && (
                      <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
                        {message.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default ChatSearch;
