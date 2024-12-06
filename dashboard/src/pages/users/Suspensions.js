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
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Suspensions = () => {
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [reactivationNote, setReactivationNote] = useState('');

  useEffect(() => {
    fetchSuspendedUsers();
  }, []);

  const fetchSuspendedUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users/suspended', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuspendedUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs suspendus:', error);
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

  const handleOpenReactivationDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setReactivationNote('');
  };

  const handleReactivateUser = async () => {
    try {
      await axios.put(
        `/api/admin/users/${selectedUser._id}/reactivate`,
        { note: reactivationNote },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchSuspendedUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Utilisateurs Suspendus
      </Typography>

      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date de suspension</TableCell>
                <TableCell>Raison</TableCell>
                <TableCell>Suspendu par</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suspendedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      {user.nom} {user.prenom}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.suspensionDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={user.suspensionReason}>
                        <span>
                          {user.suspensionReason.length > 50
                            ? `${user.suspensionReason.substring(0, 50)}...`
                            : user.suspensionReason}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {user.suspendedBy?.nom} {user.suspendedBy?.prenom}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Historique">
                        <IconButton size="small">
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Détails">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Réactiver">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenReactivationDialog(user)}
                          color="success"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={suspendedUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count}`
          }
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Réactiver l'utilisateur</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph sx={{ mt: 1 }}>
            Vous êtes sur le point de réactiver le compte de{' '}
            <strong>
              {selectedUser?.nom} {selectedUser?.prenom}
            </strong>
            . Veuillez ajouter une note explicative.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Note de réactivation"
            fullWidth
            multiline
            rows={4}
            value={reactivationNote}
            onChange={(e) => setReactivationNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleReactivateUser}
            variant="contained"
            color="success"
            disabled={!reactivationNote.trim()}
          >
            Réactiver
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suspensions;
