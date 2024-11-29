import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DeviceHub as DeviceIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConnectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/connection-history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredHistory = history.filter(entry =>
    entry.user.nom.toLowerCase().includes(filter.toLowerCase()) ||
    entry.location.toLowerCase().includes(filter.toLowerCase()) ||
    entry.device.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      case 'idle': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Historique des connexions
        </Typography>
        <Tooltip title="Rafraîchir">
          <IconButton onClick={loadHistory} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Filtrer..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: <FilterIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Appareil</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Connexion</TableCell>
              <TableCell>Déconnexion</TableCell>
              <TableCell>Durée</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {entry.user.avatar ? (
                        <img
                          src={entry.user.avatar}
                          alt={entry.user.nom}
                          style={{ width: 24, height: 24, borderRadius: '50%' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem'
                          }}
                        >
                          {entry.user.nom[0]}
                        </Box>
                      )}
                      {entry.user.nom}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={entry.status}
                      color={getStatusColor(entry.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeviceIcon fontSize="small" />
                      {entry.device}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" />
                      {entry.location}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.connectedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {entry.disconnectedAt
                      ? format(new Date(entry.disconnectedAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {entry.duration}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredHistory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
      />
    </Paper>
  );
};

export default ConnectionHistory;
