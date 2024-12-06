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
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [acceptResponsibility, setAcceptResponsibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError(null); // Réinitialiser l'erreur lors de la modification
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!formData.email || !formData.password) {
      setLocalError("Veuillez remplir tous les champs");
      return;
    }

    if (!acceptResponsibility) {
      setLocalError("Veuillez accepter vos responsabilités d'administrateur");
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      const success = await login(formData);
      if (!success) {
        setLocalError("Échec de la connexion. Veuillez vérifier vos identifiants.");
      }
    } catch (error) {
      setLocalError(error.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const error = localError || authError;

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

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ mt: 1, width: '100%' }}
            noValidate
          >
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
              error={!!error}
              disabled={loading}
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
              error={!!error}
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptResponsibility}
                  onChange={(e) => {
                    setAcceptResponsibility(e.target.checked);
                    setLocalError(null);
                  }}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Je comprends mes responsabilités en tant qu'administrateur"
              sx={{ mt: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                height: 48,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                },
                '&:disabled': {
                  background: '#ccc',
                }
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
