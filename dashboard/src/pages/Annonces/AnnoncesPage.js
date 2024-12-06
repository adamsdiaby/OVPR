import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { createApiClient } from '../../config/api';
import AnnonceDialog from './AnnonceDialog';
import ViewAnnonceDialog from './ViewAnnonceDialog';
import Layout from '../../components/Layout/Layout';

const categories = [
  'Appartement',
  'Maison',
  'Villa',
  'Studio',
  'Bureau',
  'Local commercial',
  'Terrain'
];

const AnnoncesPage = () => {
  // États
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });

  // Fonction pour charger les annonces
  const fetchAnnonces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const apiClient = createApiClient(token);
      const response = await apiClient.get('/annonces');
      
      setAnnonces(response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      setError('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les annonces au montage
  useEffect(() => {
    fetchAnnonces();
  }, [fetchAnnonces]);

  // Gestionnaires d'événements
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (annonce = null) => {
    setSelectedAnnonce(annonce);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedAnnonce(null);
    setOpenDialog(false);
  };

  const handleOpenViewDialog = (annonce) => {
    setSelectedAnnonce(annonce);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedAnnonce(null);
    setOpenViewDialog(false);
  };

  const handleOpenDeleteDialog = (annonce) => {
    setSelectedAnnonce(annonce);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedAnnonce(null);
    setOpenDeleteDialog(false);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleDeleteAnnonce = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiClient = createApiClient(token);
      await apiClient.delete(`/annonces/${selectedAnnonce._id}`);
      handleCloseDeleteDialog();
      fetchAnnonces();
    } catch (error) {
      setError('Erreur lors de la suppression de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogSuccess = () => {
    fetchAnnonces();
  };

  // Filtrer les annonces
  const filteredAnnonces = annonces.filter(annonce => {
    return (
      (!filters.category || annonce.category === filters.category) &&
      (!filters.status || annonce.status === filters.status) &&
      (!filters.search || 
        annonce.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        annonce.description.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  // Pagination
  const paginatedAnnonces = filteredAnnonces.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const content = (
    <Container maxWidth="xl">
      <Box py={4}>
        {/* En-tête */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Gestion des Annonces
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Annonce
          </Button>
        </Box>

        {/* Filtres */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="search"
                label="Rechercher"
                variant="outlined"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  endAdornment: <SearchIcon />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="category"
                label="Catégorie"
                select
                variant="outlined"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <MenuItem value="">Toutes</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="status"
                label="Statut"
                select
                variant="outlined"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
                <MenuItem value="signaled">Signalé</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Messages d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Table des annonces */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Localisation</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedAnnonces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucune annonce trouvée
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAnnonces.map((annonce) => (
                  <TableRow key={annonce._id}>
                    <TableCell>{annonce.title}</TableCell>
                    <TableCell>{annonce.category}</TableCell>
                    <TableCell>{annonce.price}€</TableCell>
                    <TableCell>{annonce.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={annonce.status}
                        color={
                          annonce.status === 'active' ? 'success' :
                          annonce.status === 'inactive' ? 'default' :
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(annonce.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(annonce)}
                        title="Modifier"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(annonce)}
                        title="Supprimer"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenViewDialog(annonce)}
                        title="Voir"
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAnnonces.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>

        {/* Dialog pour créer/modifier une annonce */}
        <AnnonceDialog
          open={openDialog}
          onClose={handleCloseDialog}
          annonce={selectedAnnonce}
          onSuccess={handleDialogSuccess}
        />

        {/* Dialog pour voir les détails d'une annonce */}
        <ViewAnnonceDialog
          open={openViewDialog}
          onClose={handleCloseViewDialog}
          annonce={selectedAnnonce}
        />

        {/* Dialog de confirmation de suppression */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'annonce "{selectedAnnonce?.title}" ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
            <Button onClick={handleDeleteAnnonce} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );

  return <Layout>{content}</Layout>;
};

export default AnnoncesPage;
