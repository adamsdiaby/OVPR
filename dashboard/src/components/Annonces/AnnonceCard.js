import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ValidateIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

const getStatusColor = (status) => {
  const colors = {
    'volé': '#6B46C1',
    'perdu': '#805AD5',
    'retrouvé': '#ECC94B',
    'en_attente': '#718096'
  };
  return colors[status] || '#718096';
};

const AnnonceCard = ({ annonce, onValidate, onReject, onEdit }) => {
  return (
    <Card
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={annonce.image || '/default-image.jpg'}
        alt={annonce.titre}
        sx={{
          objectFit: 'cover',
          borderBottom: '1px solid #E2E8F0'
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={annonce.status}
            sx={{
              backgroundColor: getStatusColor(annonce.status),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(annonce.date).toLocaleDateString()}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          {annonce.titre}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon sx={{ mr: 1, color: '#718096' }} />
          <Typography variant="body2" color="text.secondary">
            {annonce.localisation}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CategoryIcon sx={{ mr: 1, color: '#718096' }} />
          <Typography variant="body2" color="text.secondary">
            {annonce.categorie}
          </Typography>
        </Box>

        {annonce.numeroSerie && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            N° Série: {annonce.numeroSerie}
          </Typography>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mt: 2,
          pt: 2,
          borderTop: '1px solid #E2E8F0'
        }}>
          <Tooltip title="Valider">
            <IconButton 
              onClick={() => onValidate(annonce.id)}
              sx={{ color: '#48BB78' }}
            >
              <ValidateIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rejeter">
            <IconButton 
              onClick={() => onReject(annonce.id)}
              sx={{ color: '#F56565' }}
            >
              <RejectIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton 
              onClick={() => onEdit(annonce.id)}
              sx={{ color: '#4299E1' }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnnonceCard;
