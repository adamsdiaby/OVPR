import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@mui/material';
import SharedLayout from '../../components/SharedLayout/SharedLayout';

const HistoryContent = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const activities = [
    {
      id: 1,
      user: 'Admin System',
      action: 'Mise à jour du statut',
      details: 'Changement de statut pour l\'annonce #1234',
      timestamp: '2024-01-15 14:30',
      type: 'modification'
    },
    {
      id: 2,
      user: 'Agent Martin',
      action: 'Nouvelle vérification',
      details: 'Vérification effectuée pour l\'utilisateur #5678',
      timestamp: '2024-01-15 13:15',
      type: 'vérification'
    },
    {
      id: 3,
      user: 'Support Technique',
      action: 'Résolution ticket',
      details: 'Ticket #9012 résolu',
      timestamp: '2024-01-15 11:45',
      type: 'support'
    },
    {
      id: 4,
      user: 'Modérateur',
      action: 'Suppression commentaire',
      details: 'Commentaire supprimé sur l\'annonce #3456',
      timestamp: '2024-01-15 10:20',
      type: 'modération'
    }
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getChipColor = (type) => {
    switch (type) {
      case 'modification':
        return 'primary';
      case 'vérification':
        return 'success';
      case 'support':
        return 'info';
      case 'modération':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Historique des Activités
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Détails</TableCell>
                <TableCell>Date/Heure</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((activity) => (
                  <TableRow hover key={activity.id}>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>{activity.timestamp}</TableCell>
                    <TableCell>
                      <Chip
                        label={activity.type}
                        color={getChipColor(activity.type)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={activities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
    </Box>
  );
};

const History = () => {
  return (
    <SharedLayout>
      <HistoryContent />
    </SharedLayout>
  );
};

export default History;
