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
  Grid,
  Card,
  CardMedia,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const NouvellesAnnonces = () => {
  const theme = useTheme();
  const [annonces, setAnnonces] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);

  useEffect(() => {
    fetchAnnonces();
  }, [page, rowsPerPage]);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      // Simuler un appel API
      const response = await fetch('/api/annonces/pending', {
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

  const handleView = (annonce) => {
    setSelectedAnnonce(annonce);
    setOpenDialog(true);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleApprove = async (id) => {
    try {
      // Appel API pour approuver l'annonce
      await fetch(`/api/annonces/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOpenDialog(false);
      fetchAnnonces();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      // Appel API pour rejeter l'annonce
      await fetch(`/api/annonces/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      setRejectReason('');
      setOpenDialog(false);
      fetchAnnonces();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nouvelles Annonces
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Validez les nouvelles annonces avant leur publication
        </Typography>
      </Box>

      {/* Table des annonces */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Auteur</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Chargement...</TableCell>
              </TableRow>
            ) : annonces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Aucune nouvelle annonce à valider</TableCell>
              </TableRow>
            ) : (
              annonces.map((annonce) => (
                <TableRow key={annonce.id}>
                  <TableCell>{annonce.id}</TableCell>
                  <TableCell>{annonce.title}</TableCell>
                  <TableCell>{annonce.category}</TableCell>
                  <TableCell>{annonce.author}</TableCell>
                  <TableCell>{new Date(annonce.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir détails">
                      <IconButton onClick={() => handleView(annonce)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Approuver">
                      <IconButton onClick={() => handleApprove(annonce.id)} size="small" color="success">
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rejeter">
                      <IconButton onClick={() => handleView(annonce)} size="small" color="error">
                        <CloseIcon />
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

      {/* Dialog pour voir les détails et rejeter */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Détails de l'annonce
        </DialogTitle>
        <DialogContent>
          {selectedAnnonce && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAnnonce.title}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Catégorie :</strong> {selectedAnnonce.category}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Auteur :</strong> {selectedAnnonce.author}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Date de création :</strong> {new Date(selectedAnnonce.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Lieu :</strong> {selectedAnnonce.location}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Contact :</strong> {selectedAnnonce.contact}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="body1" paragraph>
                <strong>Description :</strong>
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedAnnonce.description}
              </Typography>

              <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                <strong>Images :</strong>
              </Typography>
              <Grid container spacing={2}>
                {selectedAnnonce.images?.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={image}
                        alt={`Image ${index + 1}`}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleImageClick(image)}
                      />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)' }}
                        onClick={() => handleImageClick(image)}
                      >
                        <ZoomInIcon />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <TextField
                fullWidth
                label="Raison du rejet"
                multiline
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                sx={{ mt: 3 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Fermer
          </Button>
          <Button 
            onClick={() => handleApprove(selectedAnnonce?.id)}
            color="success"
            variant="contained"
          >
            Approuver
          </Button>
          <Button
            onClick={() => handleReject(selectedAnnonce?.id)}
            color="error"
            variant="contained"
            disabled={!rejectReason}
          >
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour zoomer sur les images */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Image agrandie"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NouvellesAnnonces;
