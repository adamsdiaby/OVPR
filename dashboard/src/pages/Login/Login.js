import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [responsibilityAccepted, setResponsibilityAccepted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responsibilityAccepted) {
      setError('Veuillez confirmer que vous avez pris conscience de vos responsabilités');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/admin/auth/login', formData);
      localStorage.setItem('adminToken', response.data.token);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(
        error.response?.data?.message ||
        'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #6B46C1 30%, #ECC94B 90%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 4, color: '#6B46C1', fontWeight: 'bold' }}
          >
            OVPR Admin Dashboard
          </Typography>

          <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
            Avis aux Administrateurs
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, textAlign: 'justify' }}>
            En tant qu'administrateur, vous jouez un rôle essentiel dans le bon fonctionnement 
            et la sécurité de cette application.
          </Typography>

          <Typography variant="subtitle1" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
            Prenez conscience que :
          </Typography>

          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Chaque action effectuée ici peut avoir un impact direct sur les utilisateurs et l'application.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Une erreur ou une manipulation incorrecte pourrait entraîner des pertes de données, 
              des interruptions de service ou des atteintes à la sécurité.
            </Typography>
          </Box>

          <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
            Nous vous demandons de :
          </Typography>

          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Travailler avec la plus grande attention.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Vérifier vos actions avant de les valider.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Consulter la documentation ou le support technique en cas de doute.
            </Typography>
          </Box>

          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              fontStyle: 'italic',
              color: 'primary.main',
              textAlign: 'center'
            }}
          >
            "Un bon administrateur est celui qui agit avec prudence et précision, car chaque détail compte."
          </Typography>

          <Divider sx={{ width: '100%', mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
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
                  checked={responsibilityAccepted}
                  onChange={(e) => setResponsibilityAccepted(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Je comprends que toute manipulation inappropriée peut avoir de graves conséquences
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !responsibilityAccepted}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                backgroundColor: '#6B46C1',
                '&:hover': {
                  backgroundColor: '#553C9A',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#9F7AEA',
                  color: 'white',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Je comprends et je me connecte'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
