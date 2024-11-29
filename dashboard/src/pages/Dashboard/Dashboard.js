import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import StatCard from '../../components/Dashboard/StatCard';
import { BarChartCard, PieChartCard } from '../../components/Dashboard/ChartCard';
import ActivityChart from './ActivityChart';
import axios from 'axios';
import {
  LocalPolice as StolenIcon,
  SearchOff as LostIcon,
  FindInPage as FoundIcon,
  Report as ReportIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    stolen: 0,
    lost: 0,
    found: 0,
    reports: 0,
    activityData: [],
    categoryData: [],
    statusData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/statistics/overview', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    fetchDashboardData();
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Objets Volés',
      value: stats.stolen,
      icon: <StolenIcon />,
      color: '#6B46C1'
    },
    {
      title: 'Objets Perdus',
      value: stats.lost,
      icon: <LostIcon />,
      color: '#805AD5'
    },
    {
      title: 'Objets Retrouvés',
      value: stats.found,
      icon: <FoundIcon />,
      color: '#ECC94B'
    },
    {
      title: 'Signalements',
      value: stats.reports,
      icon: <ReportIcon />,
      color: '#D69E2E'
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* En-tête du tableau de bord */}
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            color: '#2D3748',
            fontWeight: 'bold' 
          }}
        >
          Tableau de Bord
        </Typography>

        {/* Cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* Graphiques */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <ActivityChart data={stats.activityData} />
          </Grid>
          <Grid item xs={12} md={4}>
            <PieChartCard
              title="Répartition par Catégorie"
              data={stats.categoryData}
            />
          </Grid>
          <Grid item xs={12}>
            <BarChartCard
              title="État des Signalements"
              data={stats.statusData}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
