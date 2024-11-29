import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalPolice as PoliceIcon,
  Security as SecurityIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import StatsWidget from '../../components/Dashboard/StatsWidget';
import axios from 'axios';

const LawEnforcementDashboard = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    pendingValidation: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/law-enforcement/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await axios.get(`http://localhost:3000/law-enforcement/search?q=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      // Traiter les résultats...
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const handleCaseClick = (caseData) => {
    setSelectedCase(caseData);
    setDialogOpen(true);
  };

  const handleDownloadReport = async (caseId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/law-enforcement/report/${caseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/pdf'
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-${caseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* En-tête */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(145deg, #1a237e 0%, #0d47a1 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <SecurityIcon sx={{ fontSize: 40 }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Interface Forces de l'Ordre
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                Gestion et suivi des objets trouvés
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Widgets statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Total des Cas"
              value={stats.totalCases}
              icon={PoliceIcon}
              color="primary"
              change={5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Cas Actifs"
              value={stats.activeCases}
              icon={SecurityIcon}
              color="warning"
              total={stats.totalCases}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="Cas Résolus"
              value={stats.resolvedCases}
              icon={ViewIcon}
              color="success"
              change={2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsWidget
              title="En Attente"
              value={stats.pendingValidation}
              icon={SecurityIcon}
              color="error"
              info="Cas nécessitant une validation"
            />
          </Grid>
        </Grid>

        {/* Barre de recherche */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par numéro de cas, description, localisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="Objets de valeur"
              onClick={() => setSearchQuery('valeur')}
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Documents officiels"
              onClick={() => setSearchQuery('documents')}
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Cas urgents"
              onClick={() => setSearchQuery('urgent')}
              color="error"
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* Liste des cas */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Derniers Cas Signalés
          </Typography>
          {/* Liste à implémenter */}
        </Paper>

        {/* Dialog détails du cas */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Détails du Cas #{selectedCase?.id}
          </DialogTitle>
          <DialogContent dividers>
            {selectedCase && (
              <Grid container spacing={2}>
                {/* Détails à implémenter */}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Imprimer
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadReport(selectedCase?.id)}
              variant="contained"
            >
              Télécharger le rapport
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LawEnforcementDashboard;
