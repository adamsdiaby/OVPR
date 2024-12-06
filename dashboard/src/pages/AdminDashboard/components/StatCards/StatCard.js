import React from 'react';
import { Card, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, color }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  height: '100%',
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: color,
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderTopRightRadius: theme.shape.borderRadius * 2,
  },
}));

const StatCard = ({ title, value, icon: Icon, color, description }) => {
  return (
    <StyledCard color={color}>
      <Box sx={{ position: 'relative' }}>
        {/* Icône et titre */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '12px',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: color, fontSize: '2rem' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Tooltip title={description} arrow placement="top">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Valeur */}
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: color }}>
          {value}
        </Typography>
      </Box>
    </StyledCard>
  );
};

export default StatCard;
