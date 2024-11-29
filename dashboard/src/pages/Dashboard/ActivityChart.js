import React from 'react';
import { Paper, Typography } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const ActivityChart = ({ data }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: 400,
        backgroundColor: 'white',
        borderRadius: 2,
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', mb: 3 }}>
        Activité Utilisateurs
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAnnonces" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B46C1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6B46C1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRecherches" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ECC94B" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ECC94B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            stroke="#718096"
            tick={{ fill: '#718096' }}
          />
          <YAxis 
            stroke="#718096"
            tick={{ fill: '#718096' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E2E8F0',
              borderRadius: '4px'
            }}
          />
          <Area
            type="monotone"
            dataKey="nouvelles_annonces"
            stroke="#6B46C1"
            fillOpacity={1}
            fill="url(#colorAnnonces)"
            name="Nouvelles Annonces"
          />
          <Area
            type="monotone"
            dataKey="recherches"
            stroke="#ECC94B"
            fillOpacity={1}
            fill="url(#colorRecherches)"
            name="Recherches"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ActivityChart;
