import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  TextField,
  InputAdornment,
  useTheme,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
  IconButton,
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import StatCardGrid from './components/StatCards/StatCardGrid';
import InteractiveMap from './components/InteractiveMap/InteractiveMap';
import EvolutionCharts from './components/Charts/EvolutionCharts';

const AdminDashboard = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [structureFilter, setStructureFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data] = useState([
    {
      id: 1,
      dateDebut: '2024-01-06',
      structure: 'Clinique Médicale Cœur Santé',
      status: 'inactif',
      type: 'Médical',
      region: 'Paris',
      montant: '15000 €',
    },
    {
      id: 2,
      dateDebut: '2024-01-07',
      structure: 'HOPITAL MERE ENFANT',
      status: 'actif',
      type: 'Hospitalier',
      region: 'Lyon',
      montant: '25000 €',
    },
    {
      id: 3,
      dateDebut: '2024-01-01',
      structure: 'POLYCLINIQUE CENTRALE',
      status: 'actif',
      type: 'Clinique',
      region: 'Marseille',
      montant: '18000 €',
    },
    {
      id: 4,
      dateDebut: '2024-01-24',
      structure: 'CHU CNAM',
      status: 'inactif',
      type: 'Universitaire',
      region: 'Toulouse',
      montant: '30000 €',
    },
    {
      id: 5,
      dateDebut: '2024-01-24',
      structure: 'BOSTON',
      status: 'actif',
      type: 'International',
      region: 'Bordeaux',
      montant: '22000 €',
    },
  ]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStructureFilter = (e) => {
    setStructureFilter(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.structure.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStructure = structureFilter === '' || item.type === structureFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    return matchesSearch && matchesStructure && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === 'actif' ? '#4CAF50' : '#f44336';
  };

  const getStatusIcon = (status) => {
    return status === 'actif' ? (
      <Box sx={{ color: '#4CAF50' }} component="span">
        &#10004;
      </Box>
    ) : (
      <Box sx={{ color: '#f44336' }} component="span">
        &#10006;
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Header onDrawerToggle={handleDrawerToggle} />
      <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - 220px)` },
          ml: { sm: `220px` },
          mt: '64px',
        }}
      >
        {/* En-tête de la page */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Tableau de bord administrateur
          </Typography>

          {/* Barre de filtres */}
          <Box 
            sx={{ 
              display: 'flex',
              gap: 2,
              mb: 3,
              alignItems: 'center'
            }}
          >
            <TextField
              size="small"
              placeholder="Rechercher"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                width: '300px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                }
              }}
            />
            
            <Select
              size="small"
              value={structureFilter}
              onChange={handleStructureFilter}
              displayEmpty
              sx={{ 
                width: '250px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                }
              }}
            >
              <MenuItem value="">Rechercher par structure</MenuItem>
              <MenuItem value="Médical">Médical</MenuItem>
              <MenuItem value="Hospitalier">Hospitalier</MenuItem>
              <MenuItem value="Clinique">Clinique</MenuItem>
              <MenuItem value="Universitaire">Universitaire</MenuItem>
              <MenuItem value="International">International</MenuItem>
            </Select>

            <Select
              size="small"
              value={statusFilter}
              onChange={handleStatusFilter}
              displayEmpty
              sx={{ 
                width: '150px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                }
              }}
            >
              <MenuItem value="">Status</MenuItem>
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="inactif">Inactif</MenuItem>
            </Select>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#00c853',
                '&:hover': {
                  bgcolor: '#00a844',
                },
                textTransform: 'none',
                borderRadius: '4px',
              }}
            >
              Créer une convention
            </Button>
          </Box>

          {/* Cartes statistiques */}
          <Grid item xs={12}>
            <StatCardGrid />
          </Grid>

          {/* Carte interactive et graphiques */}
          <Grid item xs={12} md={8}>
            <Card 
              elevation={0}
              sx={{ 
                height: '400px',
                borderRadius: 2,
                bgcolor: 'background.paper',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ height: '100%', p: 0 }}>
                <InteractiveMap />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              elevation={0}
              sx={{ 
                height: '400px',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                  Évolution
                </Typography>
                <EvolutionCharts />
              </CardContent>
            </Card>
          </Grid>

          {/* Liste des annonces */}
          <Grid item xs={12}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                bgcolor: 'background.paper',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                  Liste des annonces
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>#</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>Date début contrat</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>Structure</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>Type</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>Région</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>Montant</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#666' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, index) => (
                        <tr 
                          key={row.id}
                          style={{
                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                            borderBottom: '1px solid #e0e0e0',
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                          <td style={{ padding: '12px 16px' }}>{row.dateDebut}</td>
                          <td style={{ padding: '12px 16px' }}>{row.structure}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                bgcolor: 'secondary.light',
                                color: 'secondary.dark',
                              }}
                            >
                              {row.type}
                            </Box>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{row.region}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Typography sx={{ fontWeight: 500, color: 'success.main' }}>
                              {row.montant}
                            </Typography>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                bgcolor: row.status === 'actif' ? '#e8f5e9' : '#ffebee',
                                color: row.status === 'actif' ? '#2e7d32' : '#c62828',
                              }}
                            >
                              {row.status}
                            </Box>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" sx={{ color: 'primary.main' }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" sx={{ color: 'warning.main' }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" sx={{ color: 'error.main' }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>

                {/* Pagination */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    borderTop: '1px solid #e0e0e0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Lignes par page:
                    </Typography>
                    <Select
                      size="small"
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(e.target.value)}
                      sx={{ height: 24, minWidth: 64 }}
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                    </Select>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    1-5 sur 5
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
