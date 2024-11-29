import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
  useTheme
} from '@mui/material';
import {
  CheckCircle as ValidateIcon,
  Cancel as RejectIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const getStatusColor = (status) => {
  switch (status) {
    case 'validé':
      return 'success';
    case 'rejeté':
      return 'error';
    case 'en_attente':
      return 'warning';
    default:
      return 'default';
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'annonce_deletion':
    case 'permission_change':
      return '#EF4444'; // Rouge
    case 'admin_creation':
      return '#3B82F6'; // Bleu
    case 'alerte_broadcast':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gris
  }
};

const ActivityLog = ({ logs, onValidate, onReject, onViewDetails, isSuperAdmin }) => {
  const theme = useTheme();

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      annonce_deletion: 'Suppression d\'annonce',
      admin_creation: 'Création d\'administrateur',
      permission_change: 'Modification des permissions',
      alerte_broadcast: 'Diffusion d\'alerte'
    };
    return labels[action] || action;
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.default
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
        Journal d'Activité
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Validé par</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow 
                key={log._id}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: getActionColor(log.action)
                      }}
                    />
                    {getActionLabel(log.action)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.statut}
                    size="small"
                    color={getStatusColor(log.statut)}
                  />
                </TableCell>
                <TableCell>
                  {log.validePar ? (
                    `${log.validePar.prenom} ${log.validePar.nom}`
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Voir les détails">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(log)}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {isSuperAdmin && log.statut === 'en_attente' && (
                    <>
                      <Tooltip title="Valider">
                        <IconButton
                          size="small"
                          onClick={() => onValidate(log._id)}
                          sx={{ color: theme.palette.success.main }}
                        >
                          <ValidateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeter">
                        <IconButton
                          size="small"
                          onClick={() => onReject(log._id)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ActivityLog;
