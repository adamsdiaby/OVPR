import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { Assessment as AssessmentIcon, TrendingUp } from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout/SharedLayout';

const StatisticsContent = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAnnouncements: 0,
    policeAccounts: 0,
    verifications: 0
  });

  // Données mensuelles
  const monthlyData = [
    { mois: 'Janvier', annonces: 65, utilisateurs: 120 },
    { mois: 'Février', annonces: 78, utilisateurs: 145 },
    { mois: 'Mars', annonces: 90, utilisateurs: 160 },
    { mois: 'Avril', annonces: 81, utilisateurs: 155 },
    { mois: 'Mai', annonces: 95, utilisateurs: 180 },
    { mois: 'Juin', annonces: 110, utilisateurs: 200 }
  ];

  // Statistiques des types d'utilisateurs
  const userTypes = [
    { type: 'Utilisateurs', count: 300, percentage: 70 },
    { type: 'Police', count: 89, percentage: 20 },
    { type: 'Modérateurs', count: 25, percentage: 6 },
    { type: 'Admins', count: 10, percentage: 4 }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setStats({
        totalUsers: 1234,
        activeAnnouncements: 567,
        policeAccounts: 89,
        verifications: 345
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ mb: 4 }}>
        Statistiques
      </Typography>

      {/* Cartes statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Utilisateurs
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Annonces Actives
              </Typography>
              <Typography variant="h4">
                {stats.activeAnnouncements}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Comptes Police
              </Typography>
              <Typography variant="h4">
                {stats.policeAccounts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Vérifications
              </Typography>
              <Typography variant="h4">
                {stats.verifications}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des données mensuelles */}
      <Paper sx={{ mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mois</TableCell>
                <TableCell align="right">Annonces</TableCell>
                <TableCell align="right">Utilisateurs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyData.map((row) => (
                <TableRow key={row.mois}>
                  <TableCell component="th" scope="row">
                    {row.mois}
                  </TableCell>
                  <TableCell align="right">{row.annonces}</TableCell>
                  <TableCell align="right">{row.utilisateurs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Distribution des utilisateurs */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Distribution des Utilisateurs
        </Typography>
        <Box>
          {userTypes.map((type) => (
            <Box key={type.type} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{type.type}</Typography>
                <Typography variant="body2">{type.count}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={type.percentage} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

const Statistics = () => {
  return (
    <SharedLayout>
      <StatisticsContent />
    </SharedLayout>
  );
};

export default Statistics;
