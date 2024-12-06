import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';

const Verifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/police/verifications', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
          status: filter !== 'all' ? filter : undefined
        }
      });
      setVerifications(response.data.verifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des vérifications:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filter]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications, page, rowsPerPage, search, filter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedVerification(null);
  };

  const handleVerificationAction = async (id, action) => {
    try {
      await axios.put(`/api/admin/police/verifications/${id}/${action}`);
      fetchVerifications();
      handleCloseDetails();
    } catch (error) {
      console.error('Erreur lors de l\'action de vérification:', error);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="En attente" color="warning" />;
      case 'approved':
        return <Chip label="Approuvé" color="success" />;
      case 'rejected':
        return <Chip label="Rejeté" color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vérifications Police/Gendarmerie
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher..."
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select value={filter} onChange={handleFilterChange}>
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="approved">Approuvés</MenuItem>
              <MenuItem value="rejected">Rejetés</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date de demande</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucune vérification trouvée
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((verification) => (
                <TableRow key={verification._id}>
                  <TableCell>{verification._id}</TableCell>
                  <TableCell>{verification.agent.name}</TableCell>
                  <TableCell>{verification.type}</TableCell>
                  <TableCell>
                    {new Date(verification.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusChip(verification.status)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(verification)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={verifications.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedVerification && (
          <>
            <DialogTitle>
              Détails de la vérification
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Agent</Typography>
                  <Typography>{selectedVerification.agent.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Service</Typography>
                  <Typography>{selectedVerification.agent.service}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography>{selectedVerification.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Statut</Typography>
                  {getStatusChip(selectedVerification.status)}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Fermer</Button>
              {selectedVerification.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleVerificationAction(selectedVerification._id, 'reject')}
                    color="error"
                    startIcon={<CancelIcon />}
                  >
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => handleVerificationAction(selectedVerification._id, 'approve')}
                    color="success"
                    startIcon={<CheckCircleIcon />}
                  >
                    Approuver
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Verifications;
