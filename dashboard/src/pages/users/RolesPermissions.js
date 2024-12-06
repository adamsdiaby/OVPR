import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import axios from 'axios';

const RolesPermissions = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState({
    utilisateur: {
      annonces: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      messages: {
        send: true,
        receive: true,
      },
      signalements: {
        create: true,
        read: true,
      },
    },
    moderateur: {
      annonces: {
        read: true,
        validate: true,
        delete: true,
      },
      signalements: {
        read: true,
        process: true,
        delete: true,
      },
      utilisateurs: {
        read: true,
        suspend: true,
      },
    },
    admin: {
      annonces: {
        create: true,
        read: true,
        update: true,
        delete: true,
        validate: true,
      },
      signalements: {
        read: true,
        process: true,
        delete: true,
      },
      utilisateurs: {
        create: true,
        read: true,
        update: true,
        delete: true,
        suspend: true,
      },
      statistiques: {
        read: true,
        export: true,
      },
    },
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get('/api/admin/permissions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPermissions(response.data);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors de la récupération des permissions");
      setLoading(false);
    }
  };

  const handlePermissionChange = (role, category, action) => (event) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [category]: {
          ...prev[role][category],
          [action]: event.target.checked,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await axios.put('/api/admin/permissions', permissions, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError("Erreur lors de la sauvegarde des permissions");
    }
    setSaving(false);
  };

  const PermissionCard = ({ title, role, permissions }) => (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6' }}
        avatar={<SecurityIcon color="primary" />}
        action={
          <Tooltip title="Ces permissions définissent les actions autorisées pour ce rôle">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      <CardContent>
        {Object.entries(permissions).map(([category, actions]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="primary"
              gutterBottom
              sx={{ textTransform: 'uppercase' }}
            >
              {category}
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(actions).map(([action, value]) => (
                <Grid item xs={6} key={action}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={handlePermissionChange(role, category, action)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Gestion des Rôles et Permissions
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Les permissions ont été mises à jour avec succès
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PermissionCard
            title="Utilisateur"
            role="utilisateur"
            permissions={permissions.utilisateur}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PermissionCard
            title="Modérateur"
            role="moderateur"
            permissions={permissions.moderateur}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PermissionCard
            title="Administrateur"
            role="admin"
            permissions={permissions.admin}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RolesPermissions;
