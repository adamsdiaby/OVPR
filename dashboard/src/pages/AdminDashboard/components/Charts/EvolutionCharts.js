import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const EvolutionCharts = () => {
  // Données simulées pour le tableau d'évolution
  const monthlyData = [
    { month: 'Janvier', vole: 120, perdu: 45, retrouve: 38, oublie: 28 },
    { month: 'Février', vole: 150, perdu: 55, retrouve: 42, oublie: 31 },
    { month: 'Mars', vole: 180, perdu: 65, retrouve: 45, oublie: 35 },
    { month: 'Avril', vole: 210, perdu: 75, retrouve: 48, oublie: 38 },
    { month: 'Mai', vole: 250, perdu: 85, retrouve: 51, oublie: 42 },
    { month: 'Juin', vole: 300, perdu: 95, retrouve: 55, oublie: 45 }
  ];

  const cityData = [
    { city: 'Abidjan', vole: 120, perdu: 85, retrouve: 95, oublie: 65 },
    { city: 'Yamoussoukro', vole: 45, perdu: 35, retrouve: 40, oublie: 25 },
    { city: 'Bouaké', vole: 35, perdu: 28, retrouve: 32, oublie: 20 },
    { city: 'San Pedro', vole: 28, perdu: 22, retrouve: 25, oublie: 18 },
    { city: 'Korhogo', vole: 25, perdu: 20, retrouve: 22, oublie: 15 }
  ];

  const [timeView, setTimeView] = React.useState('monthly');

  const handleTimeViewChange = (event, newView) => {
    if (newView !== null) {
      setTimeView(newView);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ mr: 1 }} />
            Évolution des Annonces
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2">Afficher par :</Typography>
              <ToggleButtonGroup
                value={timeView}
                exclusive
                onChange={handleTimeViewChange}
                size="small"
              >
                <ToggleButton value="monthly">Par Mois</ToggleButton>
                <ToggleButton value="city">Par Ville</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {timeView === 'monthly' ? (
                    <TableCell>Mois</TableCell>
                  ) : (
                    <TableCell>Ville</TableCell>
                  )}
                  <TableCell align="right">Volés</TableCell>
                  <TableCell align="right">Perdus</TableCell>
                  <TableCell align="right">Retrouvés</TableCell>
                  <TableCell align="right">Oubliés</TableCell>
                  <TableCell align="right">Progression</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeView === 'monthly' ? (
                  monthlyData.map((row) => (
                    <TableRow 
                      key={row.month}
                      sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.month}
                      </TableCell>
                      <TableCell align="right">{row.vole}</TableCell>
                      <TableCell align="right">{row.perdu}</TableCell>
                      <TableCell align="right">{row.retrouve}</TableCell>
                      <TableCell align="right">{row.oublie}</TableCell>
                      <TableCell align="right" sx={{ width: '30%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(row.vole / 300) * 100}
                          sx={{ 
                            height: 8, 
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: '#2196f3'
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  cityData.map((row) => (
                    <TableRow 
                      key={row.city}
                      sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.city}
                      </TableCell>
                      <TableCell align="right">{row.vole}</TableCell>
                      <TableCell align="right">{row.perdu}</TableCell>
                      <TableCell align="right">{row.retrouve}</TableCell>
                      <TableCell align="right">{row.oublie}</TableCell>
                      <TableCell align="right" sx={{ width: '30%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(row.vole / 120) * 100}
                          sx={{ 
                            height: 8, 
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: '#2196f3'
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EvolutionCharts;
