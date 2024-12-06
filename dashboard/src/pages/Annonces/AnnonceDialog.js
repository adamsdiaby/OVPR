import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { createApiClient } from '../../config/api';
import ImageUpload from '../../components/ImageUpload/ImageUpload';

const categories = [
  'Appartement',
  'Maison',
  'Villa',
  'Studio',
  'Bureau',
  'Local commercial',
  'Terrain'
];

const initialFormData = {
  title: '',
  description: '',
  price: '',
  location: '',
  category: '',
  images: [],
  status: 'active'
};

const AnnonceDialog = ({ open, onClose, annonce, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (annonce) {
      setFormData({
        title: annonce.title || '',
        description: annonce.description || '',
        price: annonce.price || '',
        location: annonce.location || '',
        category: annonce.category || '',
        status: annonce.status || 'active',
        images: annonce.images ? annonce.images.map(url => ({ url })) : []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [annonce]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const uploadImages = async (images) => {
    const formData = new FormData();
    let uploadedImages = [];

    // Filtrer les images qui doivent être uploadées (celles qui ont un fichier)
    const imagesToUpload = images.filter(img => img.file);

    // Si aucune nouvelle image à uploader, retourner les URLs existantes
    if (imagesToUpload.length === 0) {
      return images.map(img => img.url).filter(Boolean);
    }

    // Ajouter chaque fichier au FormData
    imagesToUpload.forEach(img => {
      formData.append('images', img.file);
    });

    try {
      const token = localStorage.getItem('token');
      const apiClient = createApiClient(token);
      
      const response = await apiClient.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      uploadedImages = response.files.map(file => file.path);

      // Combiner les nouvelles URLs avec les anciennes
      return [
        ...images.filter(img => img.url).map(img => img.url),
        ...uploadedImages
      ];

    } catch (error) {
      throw new Error('Erreur lors du téléchargement des images');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload des images d'abord
      const imageUrls = await uploadImages(formData.images);

      const token = localStorage.getItem('token');
      const apiClient = createApiClient(token);

      const dataToSend = {
        ...formData,
        price: Number(formData.price),
        images: imageUrls
      };

      if (annonce) {
        await apiClient.put(`/annonces/${annonce._id}`, dataToSend);
      } else {
        await apiClient.post('/annonces', dataToSend);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {annonce ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: '€'
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Localisation"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Catégorie"
                name="category"
                select
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Statut"
                name="status"
                select
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Images
              </Typography>
              <ImageUpload
                images={formData.images}
                onChange={handleImageChange}
                disabled={loading}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload en cours... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AnnonceDialog;
