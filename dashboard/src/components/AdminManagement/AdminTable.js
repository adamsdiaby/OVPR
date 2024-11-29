import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const AdminTable = ({ admins, loading, onEdit, onToggleStatus }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif':
        return 'success';
      case 'inactif':
        return 'error';
      case 'en_attente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrateur';
      case 'moderateur':
        return 'Modérateur';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!admins.length) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1" color="textSecondary">
          Aucun administrateur trouvé
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Dernière Connexion</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((admin) => (
                <TableRow hover key={admin._id}>
                  <TableCell>
                    {admin.nom} {admin.prenom}
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(admin.role)}
                      size="small"
                      color={admin.role === 'super_admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.status}
                      size="small"
                      color={getStatusColor(admin.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Jamais connecté'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(admin)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        admin.status === 'actif'
                          ? 'Désactiver le compte'
                          : 'Activer le compte'
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() => onToggleStatus(admin._id, admin.status)}
                        color={admin.status === 'actif' ? 'error' : 'success'}
                      >
                        {admin.status === 'actif' ? (
                          <BlockIcon />
                        ) : (
                          <CheckCircleIcon />
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
        count={admins.length}
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
  );
};

export default AdminTable;
