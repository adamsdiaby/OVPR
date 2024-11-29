import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import AdminTable from '../../components/AdminManagement/AdminTable';
import AdminForm from '../../components/AdminManagement/AdminForm';
import axios from 'axios';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' ou 'edit'
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setAdmins(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des administrateurs:', error);
      setError('Erreur lors du chargement des administrateurs');
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      await axios.post('http://localhost:3000/admin/users', adminData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setNotification({
        open: true,
        message: 'Administrateur créé avec succès',
        severity: 'success'
      });
      fetchAdmins();
      handleCloseDialog();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la création',
        severity: 'error'
      });
    }
  };

  const handleUpdateAdmin = async (adminData) => {
    try {
      await axios.put(`http://localhost:3000/admin/users/${selectedAdmin._id}`, adminData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setNotification({
        open: true,
        message: 'Administrateur mis à jour avec succès',
        severity: 'success'
      });
      fetchAdmins();
      handleCloseDialog();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour',
        severity: 'error'
      });
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    try {
      await axios.put(`http://localhost:3000/admin/users/${adminId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      setNotification({
        open: true,
        message: `Statut de l'administrateur mis à jour avec succès`,
        severity: 'success'
      });
      fetchAdmins();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du statut',
        severity: 'error'
      });
    }
  };

  const handleOpenCreateDialog = () => {
    setSelectedAdmin(null);
    setDialogMode('create');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (admin) => {
    setSelectedAdmin(admin);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAdmin(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(145deg, #6B46C1 0%, #553C9A 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Gestion des Administrateurs
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                Gérez les accès et les permissions des administrateurs
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{
                  bgcolor: 'white',
                  color: '#6B46C1',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                  }
                }}
              >
                Nouvel Administrateur
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <AdminTable
          admins={admins}
          loading={loading}
          onEdit={handleOpenEditDialog}
          onToggleStatus={handleToggleStatus}
        />

        <Dialog
          fullScreen={fullScreen}
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <AdminForm
            mode={dialogMode}
            admin={selectedAdmin}
            onSubmit={dialogMode === 'create' ? handleCreateAdmin : handleUpdateAdmin}
            onCancel={handleCloseDialog}
          />
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AdminManagement;
