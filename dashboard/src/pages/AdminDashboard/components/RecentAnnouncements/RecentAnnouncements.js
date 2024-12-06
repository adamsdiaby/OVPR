import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalPolice as StolenIcon,
  HelpOutline as ForgottenIcon,
  ErrorOutline as LostIcon,
  CheckCircleOutline as FoundIcon,
} from '@mui/icons-material';

const statusConfig = {
  vole: {
    icon: StolenIcon,
    label: 'Volé',
    color: 'status.stolen',
    lightColor: 'rgba(107, 70, 193, 0.1)',
  },
  oublie: {
    icon: ForgottenIcon,
    label: 'Oublié',
    color: 'status.forgotten',
    lightColor: 'rgba(255, 152, 0, 0.1)',
  },
  perdu: {
    icon: LostIcon,
    label: 'Perdu',
    color: 'status.lost',
    lightColor: 'rgba(244, 67, 54, 0.1)',
  },
  retrouve: {
    icon: FoundIcon,
    label: 'Retrouvé',
    color: 'status.found',
    lightColor: 'rgba(76, 175, 80, 0.1)',
  },
};

const mockData = [
  {
    id: 1,
    title: 'iPhone 13 Pro',
    category: 'Électronique',
    location: 'Paris 75001',
    date: '2024-01-15',
    status: 'vole',
    description: 'iPhone 13 Pro Graphite 256GB',
    user: 'Jean Dupont',
  },
  {
    id: 2,
    title: 'Sac à main Louis Vuitton',
    category: 'Accessoires',
    location: 'Lyon 69002',
    date: '2024-01-14',
    status: 'perdu',
    description: 'Sac à main Neverfull MM',
    user: 'Marie Martin',
  },
  {
    id: 3,
    title: 'Clés de voiture BMW',
    category: 'Clés',
    location: 'Marseille 13001',
    date: '2024-01-13',
    status: 'retrouve',
    description: 'Trousseau avec 3 clés BMW',
    user: 'Pierre Durand',
  },
  {
    id: 4,
    title: 'Portefeuille',
    category: 'Accessoires',
    location: 'Toulouse 31000',
    date: '2024-01-12',
    status: 'oublie',
    description: 'Portefeuille en cuir noir',
    user: 'Sophie Bernard',
  },
];

const RecentAnnouncements = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleView = () => {
    console.log('Viewing item:', selectedItem);
    handleMenuClose();
  };

  const handleEdit = () => {
    console.log('Editing item:', selectedItem);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log('Deleting item:', selectedItem);
    handleMenuClose();
  };

  const StatusChip = ({ status }) => {
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <Chip
        icon={<StatusIcon sx={{ fontSize: '1.2rem' }} />}
        label={config.label}
        sx={{
          backgroundColor: config.lightColor,
          color: config.color,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: config.color,
          },
        }}
      />
    );
  };

  return (
    <Paper sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="600">
          Annonces Récentes
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockData.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="500">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <StatusChip status={item.status} />
                </TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, item)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: theme.shadows[2],
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Voir les détails
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Modifier
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default RecentAnnouncements;
