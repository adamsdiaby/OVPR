import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import AnnonceTable from '../../components/Annonces/AnnonceTable';

const Annonces = () => {
  const [annonces, setAnnonces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterStatus, setFilterStatus] = useState('tous');

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/annonces', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setAnnonces(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
    }
  };

  const handleEdit = async (annonce) => {
    // Implémenter la logique de modification
    console.log('Modifier annonce:', annonce);
  };

  const handleDelete = async (annonce) => {
    try {
      await axios.delete(`http://localhost:3000/admin/annonces/${annonce.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      fetchAnnonces();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleValidate = async (annonce) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/annonces/${annonce.id}/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      fetchAnnonces();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleReject = async (annonce) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/annonces/${annonce.id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      fetchAnnonces();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const filteredAnnonces = annonces.filter((annonce) => {
    const matchesSearch = annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annonce.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annonce.utilisateur.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'tous' || annonce.type === filterType;
    const matchesStatus = filterStatus === 'tous' || annonce.statut === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Gestion des Annonces</Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
        >
          Nouvelle Annonce
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="tous">Tous</MenuItem>
                  <MenuItem value="perdu">Perdu</MenuItem>
                  <MenuItem value="volé">Volé</MenuItem>
                  <MenuItem value="retrouvé">Retrouvé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filterStatus}
                  label="Statut"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="tous">Tous</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                  <MenuItem value="validé">Validé</MenuItem>
                  <MenuItem value="rejeté">Rejeté</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <AnnonceTable
        annonces={filteredAnnonces}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onValidate={handleValidate}
        onReject={handleReject}
      />
    </Box>
  );
};

export default Annonces;
