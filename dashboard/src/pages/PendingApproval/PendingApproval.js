import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

const PendingApproval = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (response.data.status === 'actif') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    const interval = setInterval(checkStatus, 30000); // Vérifie toutes les 30 secondes
    return () => clearInterval(interval);
  }, [navigate]);

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
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#6B46C1',
              mb: 3
            }}
          />
          
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
            En attente d'approbation
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: '#4A5568',
              textAlign: 'center',
              maxWidth: '80%'
            }}
          >
            Votre compte administrateur est en cours d'examen par un super administrateur.
            Vous serez automatiquement redirigé une fois votre compte approuvé.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#718096',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            Cette page se rafraîchit automatiquement toutes les 30 secondes.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PendingApproval;
