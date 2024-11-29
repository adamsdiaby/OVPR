import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { 
  LocalPolice as StolenIcon,
  SearchOff as LostIcon,
  FindInPage as FoundIcon,
  Report as ReportIcon 
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      background: `linear-gradient(45deg, ${color} 30%, ${color}99 90%)`,
      color: 'white',
      borderRadius: 2,
      height: '100%'
    }}
  >
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
      <Typography variant="subtitle2">{title}</Typography>
    </Box>
  </Paper>
);

const StatisticsOverview = ({ stats }) => {
  const cards = [
    {
      title: 'Objets Volés',
      value: stats?.stolen || 0,
      icon: <StolenIcon />,
      color: '#6B46C1'
    },
    {
      title: 'Objets Perdus',
      value: stats?.lost || 0,
      icon: <LostIcon />,
      color: '#805AD5'
    },
    {
      title: 'Objets Retrouvés',
      value: stats?.found || 0,
      icon: <FoundIcon />,
      color: '#ECC94B'
    },
    {
      title: 'Signalements',
      value: stats?.reports || 0,
      icon: <ReportIcon />,
      color: '#D69E2E'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsOverview;
