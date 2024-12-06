import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Euro as EuroIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const ViewAnnonceDialog = ({ open, onClose, annonce }) => {
  if (!annonce) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Détails de l'annonce</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Images */}
          {annonce.images && annonce.images.length > 0 && (
            <Grid item xs={12}>
              <ImageList cols={3} gap={8}>
                {annonce.images.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image}
                      alt={`${index + 1}`}
                      loading="lazy"
                      style={{ height: 200, width: '100%', objectFit: 'cover' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          )}

          {/* Titre */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {annonce.title}
            </Typography>
          </Grid>

          {/* Informations principales */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EuroIcon color="primary" />
              <Typography variant="h6">
                {annonce.price.toLocaleString()}€
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <LocationIcon color="primary" />
              <Typography>{annonce.location}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CategoryIcon color="primary" />
              <Typography>{annonce.category}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CalendarIcon color="primary" />
              <Typography>
                Publié le {new Date(annonce.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>

          {/* Statut */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="subtitle1">Statut:</Typography>
              <Chip
                label={annonce.status}
                color={
                  annonce.status === 'active' ? 'success' :
                  annonce.status === 'inactive' ? 'default' :
                  'error'
                }
                size="small"
              />
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
              {annonce.description}
            </Typography>
          </Grid>

          {/* Informations supplémentaires */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Informations supplémentaires
            </Typography>
            <Box bgcolor="grey.100" p={2} borderRadius={1}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Dernière modification
                  </Typography>
                  <Typography>
                    {new Date(annonce.updatedAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    ID de l'annonce
                  </Typography>
                  <Typography>{annonce._id}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAnnonceDialog;
