import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AccountsList = () => {
  const [accounts, setAccounts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/police/accounts', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search
        }
      });
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return <Chip 
          icon={<VerifiedIcon />} 
          label="Vérifié" 
          color="success" 
          variant="outlined" 
        />;
      case 'pending':
        return <Chip 
          icon={<PendingIcon />} 
          label="En attente" 
          color="warning" 
          variant="outlined" 
        />;
      case 'blocked':
        return <Chip 
          icon={<BlockIcon />} 
          label="Bloqué" 
          color="error" 
          variant="outlined" 
        />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Liste des Comptes Police/Gendarmerie
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Rechercher..."
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
        <Button variant="contained" color="primary">
          Nouveau Compte
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Matricule</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun compte trouvé
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account._id}>
                  <TableCell>{account._id}</TableCell>
                  <TableCell>{`${account.firstName} ${account.lastName}`}</TableCell>
                  <TableCell>{account.service}</TableCell>
                  <TableCell>{account.matricule}</TableCell>
                  <TableCell>{getStatusChip(account.status)}</TableCell>
                  <TableCell>
                    {new Date(account.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Voir les détails">
                      <IconButton size="small" color="primary">
                        <VerifiedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={accounts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
        />
      </TableContainer>
    </Box>
  );
};

export default AccountsList;
