import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Stack
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessageModeration = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState({
    action: '',
    reason: '',
    duration: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFlaggedMessages();
  }, []);

  const loadFlaggedMessages = async () => {
    try {
      const response = await fetch('/api/chat/moderation/flagged');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages signalés:', error);
    }
  };

  const handleModeration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/moderation/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId: selectedMessage._id,
          ...moderationAction
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modération');
      }

      await loadFlaggedMessages();
      setOpenDialog(false);
      setSelectedMessage(null);
      setModerationAction({ action: '', reason: '', duration: '' });
    } catch (error) {
      console.error('Erreur de modération:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      flagged: { color: 'warning', label: 'Signalé', icon: <WarningIcon /> },
      reviewing: { color: 'info', label: 'En révision', icon: <HistoryIcon /> },
      moderated: { color: 'error', label: 'Modéré', icon: <BlockIcon /> },
      approved: { color: 'success', label: 'Approuvé', icon: <CheckIcon /> }
    };

    const config = statusConfig[status];
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Modération des messages</Typography>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={loadFlaggedMessages}
        >
          Actualiser
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Raison du signalement</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message._id}>
                <TableCell>
                  {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </TableCell>
                <TableCell>{message.user.name}</TableCell>
                <TableCell>{message.content}</TableCell>
                <TableCell>{message.flagReason}</TableCell>
                <TableCell>{getStatusChip(message.status)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedMessage(message);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setSelectedMessage(message);
                      setModerationAction({ action: 'delete', reason: '', duration: '' });
                      handleModeration();
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Action de modération</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={moderationAction.action}
                onChange={(e) => setModerationAction({ ...moderationAction, action: e.target.value })}
              >
                <MenuItem value="warn">Avertir</MenuItem>
                <MenuItem value="mute">Suspendre</MenuItem>
                <MenuItem value="ban">Bannir</MenuItem>
                <MenuItem value="delete">Supprimer</MenuItem>
                <MenuItem value="approve">Approuver</MenuItem>
              </Select>
            </FormControl>

            {moderationAction.action !== 'approve' && (
              <TextField
                fullWidth
                label="Raison"
                multiline
                rows={3}
                value={moderationAction.reason}
                onChange={(e) => setModerationAction({ ...moderationAction, reason: e.target.value })}
              />
            )}

            {['mute', 'ban'].includes(moderationAction.action) && (
              <FormControl fullWidth>
                <InputLabel>Durée</InputLabel>
                <Select
                  value={moderationAction.duration}
                  onChange={(e) => setModerationAction({ ...moderationAction, duration: e.target.value })}
                >
                  <MenuItem value="1h">1 heure</MenuItem>
                  <MenuItem value="24h">24 heures</MenuItem>
                  <MenuItem value="7d">7 jours</MenuItem>
                  <MenuItem value="30d">30 jours</MenuItem>
                  <MenuItem value="permanent">Permanent</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleModeration}
            disabled={loading || !moderationAction.action}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageModeration;
