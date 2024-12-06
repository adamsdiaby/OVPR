import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Correspondence = () => {
  const [messages, setMessages] = useState([]);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/admin/police/correspondence');
      setMessages(response.data.messages);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      setLoading(false);
    }
  };

  const handleNewMessage = () => {
    setNewMessageOpen(true);
  };

  const handleCloseNewMessage = () => {
    setNewMessageOpen(false);
    setMessageText('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    try {
      const formData = new FormData();
      formData.append('text', messageText);
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await axios.post('/api/admin/police/correspondence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      handleCloseNewMessage();
      fetchMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Correspondance Police/Gendarmerie
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleNewMessage}
        >
          Nouveau Message
        </Button>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Typography align="center">Chargement...</Typography>
          </Grid>
        ) : messages.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center">Aucun message</Typography>
          </Grid>
        ) : (
          messages.map((message) => (
            <Grid item xs={12} key={message._id}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      De: {message.sender.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(message.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {message.text}
                  </Typography>
                  {message.attachments && message.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Pièces jointes:
                      </Typography>
                      {message.attachments.map((attachment, index) => (
                        <Chip
                          key={index}
                          label={attachment.name}
                          icon={<DownloadIcon />}
                          onClick={() => window.open(attachment.url)}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<SendIcon />}>
                    Répondre
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={newMessageOpen} onClose={handleCloseNewMessage} maxWidth="md" fullWidth>
        <DialogTitle>Nouveau Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              id="file-input"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
              >
                Ajouter des fichiers
              </Button>
            </label>
          </Box>
          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Fichiers sélectionnés:
              </Typography>
              {selectedFiles.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => handleRemoveFile(index)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewMessage}>Annuler</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={!messageText.trim()}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Correspondence;
