import React, { useState, useEffect } from 'react';
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
  TextField,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, {
        status: currentStatus === 'actif' ? 'suspendu' : 'actif'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Tous les Utilisateurs
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher un utilisateur..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ width: 300 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="actif">Actif</MenuItem>
            <MenuItem value="suspendu">Suspendu</MenuItem>
            <MenuItem value="en_attente">En attente</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Rôle</InputLabel>
          <Select
            value={roleFilter}
            label="Rôle"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="utilisateur">Utilisateur</MenuItem>
            <MenuItem value="moderateur">Modérateur</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell>Dernière connexion</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      {user.nom} {user.prenom}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={
                          user.status === 'actif'
                            ? 'success'
                            : user.status === 'suspendu'
                            ? 'error'
                            : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          user.status === 'actif'
                            ? 'Suspendre'
                            : 'Réactiver'
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(user._id, user.status)}
                        >
                          {user.status === 'actif' ? (
                            <BlockIcon fontSize="small" color="error" />
                          ) : (
                            <CheckCircleIcon fontSize="small" color="success" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count}`
          }
        />
      </Paper>
    </Box>
  );
};

export default AllUsers;
