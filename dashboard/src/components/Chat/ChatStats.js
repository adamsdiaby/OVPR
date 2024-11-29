import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Timeline,
  Message as MessageIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ChatStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/stats');
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

  if (loading) {
    return <LinearProgress />;
  }

  if (!stats) {
    return null;
  }

  const activityData = [
    {
      id: 'messages',
      data: stats.messageActivity.map(item => ({
        x: format(new Date(item.date), 'dd/MM', { locale: fr }),
        y: item.count
      }))
    }
  ];

  const userStats = [
    {
      id: 'Actifs',
      value: stats.activeUsers,
      color: 'hsl(120, 70%, 50%)'
    },
    {
      id: 'Inactifs',
      value: stats.inactiveUsers,
      color: 'hsl(0, 70%, 50%)'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Statistiques du chat</Typography>
        <Tooltip title="Rafraîchir">
          <IconButton onClick={loadStats}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Cartes de statistiques */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MessageIcon color="primary" />
                <Typography variant="h6">Messages</Typography>
              </Box>
              <Typography variant="h4">{stats.totalMessages}</Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.todayMessages} aujourd'hui
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                <Typography variant="h6">Utilisateurs</Typography>
              </Box>
              <Typography variant="h4">{stats.totalUsers}</Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.onlineUsers} en ligne
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline color="primary" />
                <Typography variant="h6">Salons</Typography>
              </Box>
              <Typography variant="h4">{stats.totalRooms}</Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.activeRooms} actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6">Taux d'engagement</Typography>
              </Box>
              <Typography variant="h4">{stats.engagementRate}%</Typography>
              <Typography variant="body2" color="textSecondary">
                +{stats.engagementGrowth}% cette semaine
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphiques */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Activité des messages
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveLine
                data={activityData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
                curve="monotoneX"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Date',
                  legendOffset: 36,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Messages',
                  legendOffset: -40,
                  legendPosition: 'middle'
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
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
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemBackground: 'rgba(0, 0, 0, .03)',
                          itemOpacity: 1
                        }
                      }
                    ]
                  }
                ]}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Répartition des utilisateurs
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsivePie
                data={userStats}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle'
                  }
                ]}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatStats;
