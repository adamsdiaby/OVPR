import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Container } from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Announcement as AnnouncementIcon,
  Report as ReportIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import StatsWidget from '../../components/Dashboard/StatsWidget';
import EvolutionCharts from '../AdminDashboard/components/Charts/EvolutionCharts';
import InteractiveMap from '../AdminDashboard/components/InteractiveMap/InteractiveMap';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, change: 0 },
    annonces: { total: 0, active: 0, change: 0 },
    signalements: { total: 0, pending: 0, change: 0 },
    notifications: { total: 0, unread: 0, change: 0 }
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Tableau de Bord
        </Typography>

        {/* Widgets Statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Utilisateurs"
              value={stats.users.total}
              icon={PeopleIcon}
              change={stats.users.change}
              total={stats.users.total}
              info="Nombre total d'utilisateurs inscrits"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Annonces"
              value={stats.annonces.active}
              icon={AnnouncementIcon}
              change={stats.annonces.change}
              total={stats.annonces.total}
              info="Nombre d'annonces actives"
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Signalements"
              value={stats.signalements.pending}
              icon={ReportIcon}
              change={stats.signalements.change}
              total={stats.signalements.total}
              info="Signalements en attente de traitement"
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Notifications"
              value={stats.notifications.unread}
              icon={NotificationsIcon}
              change={stats.notifications.change}
              total={stats.notifications.total}
              info="Notifications non lues"
              color="error"
            />
          </Grid>
        </Grid>

        {/* Graphiques d'évolution */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <EvolutionCharts />
          </Grid>
          <Grid item xs={12} lg={4}>
            <InteractiveMap />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
