import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import {
  FindInPage as LostIcon,
  LocalPolice as StolenIcon,
  CheckCircle as FoundIcon,
  Warning as SignalIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import axios from 'axios';
import StatCard from '../../components/Dashboard/StatCard';
import { BarChartCard, PieChartCard } from '../../components/Dashboard/ChartCard';

const Dashboard = () => {
  const [stats, setStats] = useState({
    lost: 0,
    stolen: 0,
    found: 0,
    signals: 0,
    activeUsers: 0,
    categoryStats: [],
    regionStats: [],
    statusStats: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/statistiques', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  // Données de démonstration en attendant l'API
  const demoData = {
    categoryStats: [
      { name: 'Téléphones', value: 35 },
      { name: 'Ordinateurs', value: 25 },
      { name: 'Bijoux', value: 20 },
      { name: 'Documents', value: 15 },
      { name: 'Autres', value: 5 },
    ],
    regionStats: [
      { name: 'Paris', value: 40 },
      { name: 'Lyon', value: 30 },
      { name: 'Marseille', value: 20 },
      { name: 'Toulouse', value: 10 },
    ],
    statusStats: [
      { name: 'Perdu', value: 40 },
      { name: 'Volé', value: 30 },
      { name: 'Retrouvé', value: 20 },
      { name: 'En attente', value: 10 },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        {/* Cartes statistiques */}
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Objets perdus"
            value={stats.lost || 0}
            icon={<LostIcon />}
            color="#6B46C1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Objets volés"
            value={stats.stolen || 0}
            icon={<StolenIcon />}
            color="#ECC94B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Objets retrouvés"
            value={stats.found || 0}
            icon={<FoundIcon />}
            color="#48BB78"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Signalements"
            value={stats.signals || 0}
            icon={<SignalIcon />}
            color="#F56565"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Utilisateurs actifs"
            value={stats.activeUsers || 0}
            icon={<UserIcon />}
            color="#4299E1"
          />
        </Grid>

        {/* Graphiques */}
        <Grid item xs={12} md={6}>
          <BarChartCard
            title="Répartition par catégorie"
            data={stats.categoryStats || demoData.categoryStats}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PieChartCard
            title="Répartition par statut"
            data={stats.statusStats || demoData.statusStats}
          />
        </Grid>
        <Grid item xs={12}>
          <BarChartCard
            title="Activité par région"
            data={stats.regionStats || demoData.regionStats}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
