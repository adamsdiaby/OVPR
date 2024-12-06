import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../../config/api';

const PendingApproval = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const apiClient = createApiClient(token);
      const response = await apiClient.get('/admin/status');

      if (response.status === 'actif') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      setError(error.message || 'Erreur lors de la vérification du statut');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Vérifier immédiatement le statut
    checkStatus();

    // Puis vérifier toutes les 30 secondes
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <Container component="main" maxWidth="sm">
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
            gap: 2,
          }}
        >
          <Typography component="h1" variant="h5">
            Compte en attente d'approbation
          </Typography>

          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} sx={{ opacity: loading ? 1 : 0.5 }} />
            <Typography color={loading ? 'text.primary' : 'text.secondary'}>
              {loading 
                ? "Vérification du statut de votre compte..."
                : "Votre compte est en cours d'examen par nos administrateurs."}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            Cette page se rafraîchira automatiquement lorsque votre compte sera approuvé.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PendingApproval;
