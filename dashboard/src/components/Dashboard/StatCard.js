import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        background: `linear-gradient(135deg, ${color}CC 0%, ${color} 100%)`,
        color: 'white',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 32 } })}
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;
