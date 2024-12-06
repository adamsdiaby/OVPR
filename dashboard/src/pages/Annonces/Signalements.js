import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Signalements = () => {
  const theme = useTheme();
  const [signalements, setSignalements] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchSignalements();
  }, [page, rowsPerPage]);

  const fetchSignalements = async () => {
    try {
      setLoading(true);
      // Simuler un appel API
      const response = await fetch('/api/signalements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSignalements(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (signalement) => {
    setSelectedSignalement(signalement);
    setOpenDialog(true);
  };

  const handleApprove = async (id) => {
    try {
      // Appel API pour approuver le signalement
      await fetch(`/api/signalements/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchSignalements();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      // Appel API pour rejeter le signalement
      await fetch(`/api/signalements/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      setRejectReason('');
      setOpenDialog(false);
      fetchSignalements();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'en_attente': theme.palette.warning.main,
      'approuve': theme.palette.success.main,
      'rejete': theme.palette.error.main
    };
    return colors[status] || theme.palette.grey[500];
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Signalements
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gérez les signalements d'annonces inappropriées ou frauduleuses
        </Typography>
      </Box>

      {/* Table des signalements */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Annonce</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell>Signalé par</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Chargement...</TableCell>
              </TableRow>
            ) : signalements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Aucun signalement trouvé</TableCell>
              </TableRow>
            ) : (
              signalements.map((signalement) => (
                <TableRow key={signalement.id}>
                  <TableCell>{signalement.id}</TableCell>
                  <TableCell>{signalement.annonceTitle}</TableCell>
                  <TableCell>{signalement.reason}</TableCell>
                  <TableCell>{signalement.reportedBy}</TableCell>
                  <TableCell>{new Date(signalement.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={signalement.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(signalement.status),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir détails">
                      <IconButton onClick={() => handleView(signalement)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {signalement.status === 'en_attente' && (
                      <>
                        <Tooltip title="Approuver">
                          <IconButton onClick={() => handleApprove(signalement.id)} size="small" color="success">
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rejeter">
                          <IconButton onClick={() => handleView(signalement)} size="small" color="error">
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={signalements.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>

      {/* Dialog pour voir les détails et rejeter */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Détails du signalement
        </DialogTitle>
        <DialogContent>
          {selectedSignalement && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Annonce :</strong> {selectedSignalement.annonceTitle}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Motif :</strong> {selectedSignalement.reason}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Description :</strong> {selectedSignalement.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Signalé par :</strong> {selectedSignalement.reportedBy}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date :</strong> {new Date(selectedSignalement.date).toLocaleDateString()}
              </Typography>
              
              {selectedSignalement.status === 'en_attente' && (
                <TextField
                  fullWidth
                  label="Raison du rejet"
                  multiline
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Fermer
          </Button>
          {selectedSignalement?.status === 'en_attente' && (
            <>
              <Button 
                onClick={() => handleApprove(selectedSignalement.id)}
                color="success"
                variant="contained"
              >
                Approuver
              </Button>
              <Button
                onClick={() => handleReject(selectedSignalement.id)}
                color="error"
                variant="contained"
                disabled={!rejectReason}
              >
                Rejeter
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Signalements;
