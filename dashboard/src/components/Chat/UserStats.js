import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/user-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const exportStats = async () => {
    try {
      const response = await fetch('/api/chat/user-stats/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statistiques_utilisateurs_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  if (!stats) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Statistiques par utilisateur</Typography>
        <Box>
          <Tooltip title="Rafraîchir">
            <IconButton onClick={loadStats}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exporter">
            <IconButton onClick={exportStats}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Activité par utilisateur
            </Typography>
            <ResponsiveLine
              data={stats.activityData}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: 'time', format: '%Y-%m-%d' }}
              xFormat="time:%Y-%m-%d"
              yScale={{ type: 'linear', stacked: false }}
              axisBottom={{
                format: '%d/%m',
                tickValues: 'every 2 days',
                legend: 'Date',
                legendOffset: 36
              }}
              pointSize={8}
              useMesh={true}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  symbolSize: 12,
                  symbolShape: 'circle'
                }
              ]}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Répartition des messages
            </Typography>
            <ResponsivePie
              data={stats.messageDistribution}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell align="right">Messages</TableCell>
                  <TableCell align="right">Temps en ligne</TableCell>
                  <TableCell align="right">Taux d'engagement</TableCell>
                  <TableCell align="right">Dernière activité</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.userDetails.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={user.avatar} alt={user.nom}>
                          {user.nom[0]}
                        </Avatar>
                        <Typography>{user.nom}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <MessageIcon fontSize="small" />
                        {user.messageCount}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <ScheduleIcon fontSize="small" />
                        {user.onlineTime}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <TrendingUpIcon fontSize="small" />
                        {user.engagementRate}%
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {format(new Date(user.lastActivity), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserStats;
