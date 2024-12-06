import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  LocalPolice as StolenIcon,
  HelpOutline as ForgottenIcon,
  ErrorOutline as LostIcon,
  CheckCircleOutline as FoundIcon,
  Group as UsersIcon,
  Payments as PaymentsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <Card 
    elevation={0}
    sx={{ 
      height: '100%',
      borderRadius: 2,
      bgcolor: 'background.paper',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      }
    }}
  >
    <CardContent sx={{ height: '100%', p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 1,
              fontSize: '0.875rem'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 1
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <TrendingUpIcon 
                sx={{ 
                  fontSize: '1rem',
                  color: trend >= 0 ? 'success.main' : 'error.main'
                }} 
              />
              <Typography 
                variant="body2"
                sx={{ 
                  color: trend >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 500
                }}
              >
                {trend}% ce mois
              </Typography>
            </Box>
          )}
        </Grid>
        <Grid 
          item 
          xs={4}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start'
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ fontSize: '2rem' }} />
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const StatCardGrid = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Objets Volés',
      value: '156',
      icon: StolenIcon,
      trend: 12,
      color: 'primary'
    },
    {
      title: 'Objets Oubliés',
      value: '89',
      icon: ForgottenIcon,
      trend: -5,
      color: 'warning'
    },
    {
      title: 'Objets Perdus',
      value: '234',
      icon: LostIcon,
      trend: 8,
      color: 'success'
    },
    {
      title: 'Objets Retrouvés',
      value: '167',
      icon: FoundIcon,
      trend: 15,
      color: 'info'
    },
    {
      title: 'Utilisateurs',
      value: '1,245',
      icon: UsersIcon,
      trend: 10,
      color: 'primary'
    },
    {
      title: 'Revenus',
      value: '2,890 €',
      icon: PaymentsIcon,
      trend: 20,
      color: 'success'
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Statistiques Générales
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatCardGrid;
