import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ValidateIcon,
  Block as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const getStatusColor = (status) => {
  const colors = {
    'perdu': '#F56565',
    'volé': '#ED8936',
    'retrouvé': '#48BB78',
    'en_attente': '#4299E1',
    'validé': '#48BB78',
    'rejeté': '#F56565',
  };
  return colors[status] || '#718096';
};

const AnnonceTable = ({ annonces, onEdit, onDelete, onValidate, onReject, onView }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (annonce) => {
    setSelectedAnnonce(annonce);
    setOpenDialog(true);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="table des annonces">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Titre</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Statut</TableCell>
              <TableCell sx={{ color: 'white' }}>Utilisateur</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {annonces
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((annonce) => (
                <TableRow key={annonce.id} hover>
                  <TableCell>{annonce.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={annonce.type}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(annonce.type),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>{annonce.titre}</TableCell>
                  <TableCell>{new Date(annonce.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={annonce.statut}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(annonce.statut),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>{annonce.utilisateur}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(annonce)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(annonce)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onValidate(annonce)}
                      color="success"
                    >
                      <ValidateIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onReject(annonce)}
                      color="error"
                    >
                      <RejectIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(annonce)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={annonces.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnnonce && (
          <>
            <DialogTitle>
              Détails de l'annonce
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedAnnonce.titre}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedAnnonce.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={selectedAnnonce.type}
                    sx={{
                      backgroundColor: getStatusColor(selectedAnnonce.type),
                      color: 'white',
                    }}
                  />
                  <Chip
                    label={selectedAnnonce.statut}
                    sx={{
                      backgroundColor: getStatusColor(selectedAnnonce.statut),
                      color: 'white',
                    }}
                  />
                </Box>
                {selectedAnnonce.image && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={selectedAnnonce.image}
                      alt={selectedAnnonce.titre}
                      style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                    />
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Publié par: {selectedAnnonce.utilisateur}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date: {new Date(selectedAnnonce.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Localisation: {selectedAnnonce.localisation}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
              <Button
                onClick={() => {
                  onEdit(selectedAnnonce);
                  setOpenDialog(false);
                }}
                color="primary"
              >
                Modifier
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default AnnonceTable;
