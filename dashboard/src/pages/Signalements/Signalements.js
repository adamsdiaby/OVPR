import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationOnIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Composant de carte pour les statistiques des signalements
const SignalementStatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Signalements = () => {
  const [signalements, setSignalements] = useState([]);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    traites: 0,
    zones: 0,
  });

  useEffect(() => {
    fetchSignalements();
    fetchStats();
  }, []);

  const fetchSignalements = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/signalements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setSignalements(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/signalements/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleValidate = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/signalements/${id}/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      fetchSignalements();
      fetchStats();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/signalements/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      fetchSignalements();
      fetchStats();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleViewDetails = (signalement) => {
    setSelectedSignalement(signalement);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Gestion des Signalements
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SignalementStatCard
            title="Total"
            value={stats.total}
            icon={<LocationOnIcon sx={{ color: '#6B46C1' }} />}
            color="#6B46C1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SignalementStatCard
            title="En attente"
            value={stats.enAttente}
            icon={<VisibilityIcon sx={{ color: '#ECC94B' }} />}
            color="#ECC94B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SignalementStatCard
            title="Traités"
            value={stats.traites}
            icon={<CheckCircleIcon sx={{ color: '#48BB78' }} />}
            color="#48BB78"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SignalementStatCard
            title="Zones à risque"
            value={stats.zones}
            icon={<WarningIcon sx={{ color: '#F56565' }} />}
            color="#F56565"
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Description</TableCell>
              <TableCell sx={{ color: 'white' }}>Localisation</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Statut</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {signalements.map((signalement) => (
              <TableRow key={signalement.id} hover>
                <TableCell>{signalement.id}</TableCell>
                <TableCell>
                  <Chip
                    label={signalement.type}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>{signalement.description}</TableCell>
                <TableCell>{signalement.localisation}</TableCell>
                <TableCell>
                  {new Date(signalement.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={
                      signalement.statut === 'validé'
                        ? <CheckCircleIcon />
                        : <WarningIcon />
                    }
                    label={signalement.statut}
                    color={
                      signalement.statut === 'validé'
                        ? 'success'
                        : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(signalement)}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleValidate(signalement.id)}
                    color="success"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleReject(signalement.id)}
                    color="error"
                  >
                    <BlockIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSignalement && (
          <>
            <DialogTitle>
              Détails du signalement
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Type"
                      value={selectedSignalement.type}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      value={selectedSignalement.description}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Localisation"
                      value={selectedSignalement.localisation}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      value={new Date(selectedSignalement.date).toLocaleDateString()}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
              <Button
                onClick={() => handleValidate(selectedSignalement.id)}
                color="success"
                variant="contained"
              >
                Valider
              </Button>
              <Button
                onClick={() => handleReject(selectedSignalement.id)}
                color="error"
                variant="contained"
              >
                Rejeter
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Signalements;
