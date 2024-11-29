import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import {
  FindInPage as FindIcon,
  CheckCircle as ValidateIcon,
  NotificationsActive as AlertIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import StatsWidget from '../../components/Dashboard/StatsWidget';
import axios from 'axios';

const MainDashboard = () => {
  const [stats, setStats] = useState({
    totalAnnonces: 0,
    activeAnnonces: 0,
    resolvedAnnonces: 0,
    pendingValidation: 0
  });
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Rafraîchir toutes les minutes
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/statistiques/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* En-tête */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 2
          }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <FindIcon sx={{ fontSize: 40 }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Tableau de Bord OVPR
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                Vue d'ensemble des objets perdus et retrouvés
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Widgets statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Total Annonces"
              value={stats.totalAnnonces}
              icon={FindIcon}
              color="primary"
              change={5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Annonces Actives"
              value={stats.activeAnnonces}
              icon={AlertIcon}
              color="warning"
              total={stats.totalAnnonces}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Objets Restitués"
              value={stats.resolvedAnnonces}
              icon={ValidateIcon}
              color="success"
              change={2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="En Attente"
              value={stats.pendingValidation}
              icon={PeopleIcon}
              color="error"
              info="Annonces nécessitant une validation"
            />
          </Grid>
        </Grid>

        {/* Graphiques et tableaux récapitulatifs à venir */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Évolution des Annonces
              </Typography>
              {/* Graphique à implémenter */}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Catégories les Plus Fréquentes
              </Typography>
              {/* Graphique circulaire à implémenter */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MainDashboard;
