import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
`;

const Dot = ({ delay }) => (
  <Box
    sx={{
      width: 6,
      height: 6,
      margin: '0 3px',
      backgroundColor: 'primary.main',
      borderRadius: '50%',
      display: 'inline-block',
      animation: `${bounce} 1.4s infinite ease-in-out both`,
      animationDelay: `${delay}s`
    }}
  />
);

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0].nom} est en train d'écrire`;
    } else if (users.length === 2) {
      return `${users[0].nom} et ${users[1].nom} sont en train d'écrire`;
    } else {
      return `${users.length} personnes sont en train d'écrire`;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        minHeight: 24
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontStyle: 'italic' }}
      >
        {getText()}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </Box>
    </Box>
  );
};

export default TypingIndicator;
