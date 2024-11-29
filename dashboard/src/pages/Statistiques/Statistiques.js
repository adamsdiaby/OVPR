import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const COLORS = ['#6B46C1', '#ECC94B', '#48BB78', '#F56565', '#4299E1'];

const Statistiques = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    activityOverTime: [],
    categoryDistribution: [],
    regionDistribution: [],
    userActivity: [],
    successRate: [],
    hourlyDistribution: [],
  });

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/statistiques/advanced`, {
        params: { timeRange },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setStatsData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/statistiques/export', {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'statistiques.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
          Statistiques Avancées
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={timeRange}
              label="Période"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">7 derniers jours</MenuItem>
              <MenuItem value="month">30 derniers jours</MenuItem>
              <MenuItem value="year">12 derniers mois</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={exportData}
          >
            Exporter
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Activité dans le temps */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Activité dans le temps
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer>
                  <AreaChart data={statsData.activityOverTime}>
                    <defs>
                      <linearGradient id="colorAnnonces" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6B46C1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6B46C1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSignalements" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ECC94B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ECC94B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="annonces" stroke="#6B46C1" fillOpacity={1} fill="url(#colorAnnonces)" />
                    <Area type="monotone" dataKey="signalements" stroke="#ECC94B" fillOpacity={1} fill="url(#colorSignalements)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution par catégorie */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Distribution par catégorie
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statsData.categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      {statsData.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution par région */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Distribution par région
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer>
                  <RadarChart outerRadius={150} data={statsData.regionDistribution}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar name="Objets" dataKey="value" stroke="#6B46C1" fill="#6B46C1" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activité des utilisateurs */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Activité des utilisateurs
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer>
                  <LineChart data={statsData.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="nouveaux" stroke="#48BB78" strokeWidth={2} />
                    <Line type="monotone" dataKey="actifs" stroke="#4299E1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution horaire */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Distribution horaire des annonces
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer>
                  <BarChart data={statsData.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#6B46C1" name="Nombre d'annonces" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistiques;
