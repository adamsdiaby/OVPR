import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import AnnonceCard from '../../components/Annonces/AnnonceCard';
import axios from 'axios';

const Annonces = () => {
  const [annonces, setAnnonces] = useState([]);
  const [filtres, setFiltres] = useState({
    recherche: '',
    categorie: 'tous',
    status: 'tous'
  });

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/annonces', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        setAnnonces(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
      }
    };

    fetchAnnonces();
  }, []);

  const handleValidate = async (id) => {
    try {
      await axios.put(`http://localhost:3000/admin/annonces/${id}/valider`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      // Rafraîchir la liste
      const updatedAnnonces = annonces.map(annonce => 
        annonce.id === id ? { ...annonce, status: 'validé' } : annonce
      );
      setAnnonces(updatedAnnonces);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:3000/admin/annonces/${id}/rejeter`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      // Rafraîchir la liste
      const updatedAnnonces = annonces.map(annonce => 
        annonce.id === id ? { ...annonce, status: 'rejeté' } : annonce
      );
      setAnnonces(updatedAnnonces);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleEdit = (id) => {
    // Implémenter la logique d'édition
    console.log('Édition de l\'annonce:', id);
  };

  const filteredAnnonces = annonces.filter(annonce => {
    const matchRecherche = annonce.titre.toLowerCase().includes(filtres.recherche.toLowerCase()) ||
                          annonce.numeroSerie?.toLowerCase().includes(filtres.recherche.toLowerCase());
    const matchCategorie = filtres.categorie === 'tous' || annonce.categorie === filtres.categorie;
    const matchStatus = filtres.status === 'tous' || annonce.status === filtres.status;
    
    return matchRecherche && matchCategorie && matchStatus;
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, color: '#2D3748', fontWeight: 'bold' }}>
          Gestion des Annonces
        </Typography>

        {/* Filtres */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par titre, numéro de série..."
              value={filtres.recherche}
              onChange={(e) => setFiltres({ ...filtres, recherche: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <Select
                value={filtres.categorie}
                onChange={(e) => setFiltres({ ...filtres, categorie: e.target.value })}
              >
                <MenuItem value="tous">Toutes les catégories</MenuItem>
                <MenuItem value="telephone">Téléphones</MenuItem>
                <MenuItem value="ordinateur">Ordinateurs</MenuItem>
                <MenuItem value="bijoux">Bijoux</MenuItem>
                <MenuItem value="documents">Documents</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <Select
                value={filtres.status}
                onChange={(e) => setFiltres({ ...filtres, status: e.target.value })}
              >
                <MenuItem value="tous">Tous les statuts</MenuItem>
                <MenuItem value="volé">Volé</MenuItem>
                <MenuItem value="perdu">Perdu</MenuItem>
                <MenuItem value="retrouvé">Retrouvé</MenuItem>
                <MenuItem value="en_attente">En attente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Liste des annonces */}
        <Grid container spacing={3}>
          {filteredAnnonces.map((annonce) => (
            <Grid item xs={12} sm={6} md={4} key={annonce.id}>
              <AnnonceCard
                annonce={annonce}
                onValidate={handleValidate}
                onReject={handleReject}
                onEdit={handleEdit}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Annonces;
