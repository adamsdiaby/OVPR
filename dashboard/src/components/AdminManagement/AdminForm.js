import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  Box,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';

const AdminForm = ({ mode, admin, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'moderateur',
    permissions: {
      annonces: {
        create: false,
        read: true,
        update: false,
        delete: false,
        validate: false
      },
      signalements: {
        read: true,
        process: false,
        delete: false
      },
      statistiques: {
        read: true,
        export: false
      }
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && admin) {
      setFormData({
        ...admin,
        password: '' // Ne pas inclure le mot de passe dans l'édition
      });
    }
  }, [mode, admin]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (mode === 'create' && !formData.password) newErrors.password = 'Le mot de passe est requis';
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
      }
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (resource, action) => (e) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [resource]: {
          ...prev.permissions[resource],
          [action]: e.target.checked
        }
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>
        {mode === 'create' ? 'Nouvel Administrateur' : 'Modifier l\'Administrateur'}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Informations Personnelles
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              error={!!errors.prenom}
              helperText={errors.prenom}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              error={!!errors.nom}
              helperText={errors.nom}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          {(mode === 'create' || formData.password) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Rôle"
              >
                <MenuItem value="moderateur">Modérateur</MenuItem>
                <MenuItem value="admin">Administrateur</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Permissions
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Annonces
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permissions.annonces.create}
                  onChange={handlePermissionChange('annonces', 'create')}
                />
              }
              label="Créer"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permissions.annonces.update}
                  onChange={handlePermissionChange('annonces', 'update')}
                />
              }
              label="Modifier"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permissions.annonces.delete}
                  onChange={handlePermissionChange('annonces', 'delete')}
                />
              }
              label="Supprimer"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permissions.annonces.validate}
                  onChange={handlePermissionChange('annonces', 'validate')}
                />
              }
              label="Valider"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Signalements
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permissions.signalements.process}
                  onChange={handlePermissionChange('signalements', 'process')}
                />
              }
              label="Traiter"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permissions.signalements.delete}
                  onChange={handlePermissionChange('signalements', 'delete')}
                />
              }
              label="Supprimer"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Statistiques
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permissions.statistiques.export}
                  onChange={handlePermissionChange('statistiques', 'export')}
                />
              }
              label="Exporter"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onCancel}>Annuler</Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          {mode === 'create' ? 'Créer' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default AdminForm;
