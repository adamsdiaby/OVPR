import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const ImageProgress = ({ progress, fileName }) => {
  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          {fileName}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {progress}%
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

export default ImageProgress;
