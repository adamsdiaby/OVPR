import React from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Grid,
  LinearProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const StatsWidget = ({ title, value, icon: Icon, change, total, info, color }) => {
  const theme = useTheme();
  const percentage = total ? (value / total) * 100 : 0;

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette[color]?.main || color} 0%, ${theme.palette[color]?.dark || color} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        {info && (
          <Tooltip title={info}>
            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 1,
              display: 'flex'
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        </Grid>
        <Grid item xs>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              {change >= 0 ? (
                <TrendingUpIcon sx={{ color: 'success.light', mr: 0.5, fontSize: 20 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.light', mr: 0.5, fontSize: 20 }} />
              )}
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {Math.abs(change)}% par rapport à hier
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {total && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Progression
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {Math.round(percentage)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }}
          />
        </Box>
      )}
    </Card>
  );
};

export default StatsWidget;
