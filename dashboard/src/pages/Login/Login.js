import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [acceptResponsibility, setAcceptResponsibility] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptResponsibility) {
      setError('Veuillez accepter la déclaration de responsabilité');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/admin/login', formData);
      const { token, admin } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminRole', admin.role);
      localStorage.setItem('adminPermissions', JSON.stringify(admin.permissions));
      localStorage.setItem('adminId', admin._id);
      
      // Redirection basée sur le rôle et le statut
      if (admin.status === 'en_attente') {
        navigate('/pending-approval');
      } else if (admin.role === 'super_admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              color: '#2D3748',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Espace Administrateur
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptResponsibility}
                  onChange={(e) => setAcceptResponsibility(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#4A5568' }}>
                  Je comprends mes responsabilités en tant qu'administrateur et m'engage à respecter
                  la confidentialité des données.
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                backgroundColor: '#6B46C1',
                '&:hover': {
                  backgroundColor: '#553C9A',
                },
              }}
              disabled={loading || !acceptResponsibility}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Se connecter'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
