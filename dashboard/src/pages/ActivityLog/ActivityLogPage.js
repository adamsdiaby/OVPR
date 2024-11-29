import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import ActivityLog from '../../components/AdminManagement/ActivityLog';
import axios from 'axios';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    const role = localStorage.getItem('adminRole');
    setIsSuperAdmin(role === 'super_admin');
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/admin/logs?filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      setError('Erreur lors du chargement du journal d\'activité');
      setLoading(false);
    }
  };

  const handleValidate = async (logId) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/logs/${logId}/validate`,
        { commentaire: comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      setNotification({
        open: true,
        message: 'Action validée avec succès',
        severity: 'success'
      });
      fetchLogs();
      handleCloseDialog();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la validation',
        severity: 'error'
      });
    }
  };

  const handleReject = async (logId) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/logs/${logId}/reject`,
        { commentaire: comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      setNotification({
        open: true,
        message: 'Action rejetée',
        severity: 'info'
      });
      fetchLogs();
      handleCloseDialog();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Erreur lors du rejet',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLog(null);
    setComment('');
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(145deg, #6B46C1 0%, #553C9A 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Journal d'Activité
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                Suivi des actions et validations
              </Typography>
            </Grid>
            <Grid item>
              <FormControl
                variant="outlined"
                sx={{
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
                  '& .MuiSelect-icon': {
                    color: 'white',
                  },
                }}
              >
                <InputLabel>Filtrer par statut</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filtrer par statut"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                  <MenuItem value="validé">Validés</MenuItem>
                  <MenuItem value="rejeté">Rejetés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <ActivityLog
          logs={logs}
          onValidate={handleValidate}
          onReject={handleReject}
          onViewDetails={handleViewDetails}
          isSuperAdmin={isSuperAdmin}
        />

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Détails de l'Action
          </DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Type d'action
                </Typography>
                <Typography paragraph>
                  {selectedLog.action}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Détails
                </Typography>
                <Typography paragraph>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </Typography>

                {isSuperAdmin && selectedLog.statut === 'en_attente' && (
                  <TextField
                    fullWidth
                    label="Commentaire"
                    multiline
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Fermer
            </Button>
            {isSuperAdmin && selectedLog?.statut === 'en_attente' && (
              <>
                <Button
                  onClick={() => handleReject(selectedLog._id)}
                  color="error"
                >
                  Rejeter
                </Button>
                <Button
                  onClick={() => handleValidate(selectedLog._id)}
                  color="primary"
                  variant="contained"
                >
                  Valider
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ActivityLogPage;
