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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import MultiImageUpload from '../../../components/ImageUpload/MultiImageUpload';
import { AnnoncesService } from '../../../services/annonces.service';

// Catégories et leurs champs spécifiques
const categories = {
  telephone: {
    label: 'Téléphone',
    specificFields: [
      { name: 'imei', label: 'Numéro IMEI', required: true },
      { name: 'marque', label: 'Marque', required: true },
      { name: 'modele', label: 'Modèle', required: true },
    ],
  },
  automobile: {
    label: 'Automobile',
    specificFields: [
      { name: 'vin', label: 'Numéro de châssis (VIN)', required: true },
      { name: 'marque', label: 'Marque', required: true },
      { name: 'modele', label: 'Modèle', required: true },
      { name: 'annee', label: 'Année', required: true },
      { name: 'couleur', label: 'Couleur', required: true },
    ],
  },
  ordinateur: {
    label: 'Ordinateur',
    specificFields: [
      { name: 'serialNumber', label: 'Numéro de série', required: true },
      { name: 'marque', label: 'Marque', required: true },
      { name: 'modele', label: 'Modèle', required: true },
    ],
  },
  bijoux: {
    label: 'Bijoux',
    specificFields: [
      { name: 'type', label: 'Type de bijou', required: true },
      { name: 'metal', label: 'Type de métal', required: true },
      { name: 'poids', label: 'Poids (g)', required: false },
    ],
  },
  documents: {
    label: 'Documents',
    specificFields: [
      { name: 'type', label: 'Type de document', required: true },
      { name: 'numero', label: 'Numéro du document', required: false },
    ],
  },
  vetements: {
    label: 'Vêtements',
    specificFields: [
      { name: 'type', label: 'Type de vêtement', required: true },
      { name: 'taille', label: 'Taille', required: true },
      { name: 'marque', label: 'Marque', required: false },
    ],
  },
  sacs: {
    label: 'Sacs et Bagages',
    specificFields: [
      { name: 'type', label: 'Type de sac', required: true },
      { name: 'marque', label: 'Marque', required: false },
    ],
  },
  electronique: {
    label: 'Autres Électroniques',
    specificFields: [
      { name: 'type', label: 'Type d\'appareil', required: true },
      { name: 'marque', label: 'Marque', required: true },
      { name: 'serialNumber', label: 'Numéro de série', required: false },
    ],
  },
  autres: {
    label: 'Autres',
    specificFields: [
      { name: 'type', label: 'Type d\'objet', required: true },
    ],
  },
};

// Devises disponibles
const currencies = [
  { value: 'XOF', label: 'Franc CFA (XOF)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar US (USD)' },
];

const AdminAnnoncesPage = () => {
  const theme = useTheme();
  const [annonces, setAnnonces] = useState([]);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'lost',
    location: '',
    category: '',
    contact: '',
    price: '',
    currency: 'XOF',
    specificFields: {},
  });

  // Charger les annonces au montage du composant
  useEffect(() => {
    fetchAnnonces();
  }, []);

  // Fonction pour charger les annonces
  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      const data = await AnnoncesService.getAllAnnonces();
      setAnnonces(data);
    } catch (err) {
      setError('Erreur lors du chargement des annonces');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAnnonce) {
      setFormData({
        ...selectedAnnonce,
        specificFields: selectedAnnonce.specificFields || {},
      });
      setSelectedCategory(selectedAnnonce.category);
      setImages(selectedAnnonce.images || []);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'lost',
        location: '',
        category: '',
        contact: '',
        price: '',
        currency: 'XOF',
        specificFields: {},
      });
      setSelectedCategory('');
      setImages([]);
    }
  }, [selectedAnnonce]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecificFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specificFields: {
        ...prev.specificFields,
        [field]: value,
      },
    }));
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    handleInputChange('category', category);
    setFormData(prev => ({
      ...prev,
      specificFields: {},
    }));
  };

  const handleEdit = (annonce) => {
    setSelectedAnnonce(annonce);
    setOpenDialog(true);
  };

  const handleDelete = (annonce) => {
    setSelectedAnnonce(annonce);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnonce(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAnnonce(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const annonceData = {
        ...formData,
        images,
      };

      if (selectedAnnonce) {
        await AnnoncesService.updateAnnonce(selectedAnnonce.id, annonceData);
        setSuccessMessage('Annonce mise à jour avec succès');
      } else {
        await AnnoncesService.createAnnonce(annonceData);
        setSuccessMessage('Annonce créée avec succès');
      }

      handleCloseDialog();
      fetchAnnonces();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de l\'annonce');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await AnnoncesService.deleteAnnonce(selectedAnnonce.id);
      setSuccessMessage('Annonce supprimée avec succès');
      handleCloseDeleteDialog();
      fetchAnnonces();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'annonce');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
  };

  const getStatusColor = (status) => {
    const colors = {
      lost: theme.palette.itemStatus.lost,
      found: theme.palette.itemStatus.found,
      stolen: theme.palette.itemStatus.stolen,
      forgotten: theme.palette.itemStatus.forgotten,
    };
    return colors[status] || theme.palette.grey[500];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Annonces
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Nouvelle Annonce
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {annonces.map((annonce) => (
              <TableRow key={annonce.id}>
                <TableCell>{annonce.title}</TableCell>
                <TableCell>{categories[annonce.category]?.label}</TableCell>
                <TableCell>{annonce.location}</TableCell>
                <TableCell>{new Date(annonce.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      annonce.status === 'lost' ? 'Perdu' :
                      annonce.status === 'found' ? 'Retrouvé' :
                      annonce.status === 'stolen' ? 'Volé' :
                      'Oublié'
                    }
                    sx={{
                      bgcolor: getStatusColor(annonce.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Voir">
                    <IconButton onClick={() => handleEdit(annonce)} color="info">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton onClick={() => handleEdit(annonce)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => handleDelete(annonce)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog d'édition/création */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAnnonce ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Titre"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Catégorie"
                  fullWidth
                  required
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  {Object.entries(categories).map(([key, { label }]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Statut"
                  fullWidth
                  required
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="lost">Perdu</MenuItem>
                  <MenuItem value="found">Retrouvé</MenuItem>
                  <MenuItem value="stolen">Volé</MenuItem>
                  <MenuItem value="forgotten">Oublié</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lieu"
                  fullWidth
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact"
                  fullWidth
                  required
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prix"
                  fullWidth
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Devise"
                  fullWidth
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Champs spécifiques à la catégorie */}
              {selectedCategory && categories[selectedCategory].specificFields.map((field) => (
                <Grid item xs={12} sm={6} key={field.name}>
                  <TextField
                    label={field.label}
                    fullWidth
                    required={field.required}
                    value={formData.specificFields[field.name] || ''}
                    onChange={(e) => handleSpecificFieldChange(field.name, e.target.value)}
                  />
                </Grid>
              ))}

              {/* Upload d'images */}
              <Grid item xs={12}>
                <MultiImageUpload
                  images={images}
                  setImages={setImages}
                  maxImages={5}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les messages de succès et d'erreur */}
      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAnnoncesPage;
