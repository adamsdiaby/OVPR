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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const AllAnnonces = () => {
  const theme = useTheme();
  const [annonces, setAnnonces] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnonces();
  }, [page, rowsPerPage, filters]);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      // Simuler un appel API
      const response = await fetch('/api/annonces', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnnonces(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const getStatusColor = (status) => {
    const colors = {
      'perdu': theme.palette.error.main,
      'trouve': theme.palette.success.main,
      'vole': theme.palette.warning.main,
      'en_cours': theme.palette.info.main
    };
    return colors[status] || theme.palette.grey[500];
  };

  const handleView = (id) => {
    // Implémenter la vue détaillée
    console.log('Voir annonce:', id);
  };

  const handleEdit = (id) => {
    // Implémenter l'édition
    console.log('Éditer annonce:', id);
  };

  const handleDelete = (id) => {
    // Implémenter la suppression
    console.log('Supprimer annonce:', id);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Toutes les Annonces
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gérez et surveillez toutes les annonces publiées sur la plateforme
        </Typography>
      </Box>

      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Rechercher"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status}
              label="Statut"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="perdu">Perdu</MenuItem>
              <MenuItem value="trouve">Trouvé</MenuItem>
              <MenuItem value="vole">Volé</MenuItem>
              <MenuItem value="en_cours">En cours</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={filters.category}
              label="Catégorie"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="documents">Documents</MenuItem>
              <MenuItem value="electronique">Électronique</MenuItem>
              <MenuItem value="bijoux">Bijoux</MenuItem>
              <MenuItem value="autres">Autres</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilters({ status: '', category: '', search: '' })}
          >
            Réinitialiser
          </Button>
        </Box>
      </Paper>

      {/* Table des annonces */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Auteur</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Chargement...</TableCell>
              </TableRow>
            ) : annonces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Aucune annonce trouvée</TableCell>
              </TableRow>
            ) : (
              annonces.map((annonce) => (
                <TableRow key={annonce.id}>
                  <TableCell>{annonce.id}</TableCell>
                  <TableCell>{annonce.title}</TableCell>
                  <TableCell>{annonce.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={annonce.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(annonce.status),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>{new Date(annonce.date).toLocaleDateString()}</TableCell>
                  <TableCell>{annonce.author}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir">
                      <IconButton onClick={() => handleView(annonce.id)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Éditer">
                      <IconButton onClick={() => handleEdit(annonce.id)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton onClick={() => handleDelete(annonce.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={annonces.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>
    </Box>
  );
};

export default AllAnnonces;
