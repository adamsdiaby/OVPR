import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#6B46C1', '#805AD5', '#D69E2E', '#ECC94B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #E2E8F0'
        }}
      >
        <Typography variant="body2" color="textPrimary">
          {`${label}: ${payload[0].value}`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export const BarChartCard = ({ title, data }) => (
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
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height="85%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="name" stroke="#718096" />
        <YAxis stroke="#718096" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="value" fill="#6B46C1" radius={[4, 4, 0, 0]}>
          {data?.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </Paper>
);

export const PieChartCard = ({ title, data }) => (
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
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height="85%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data?.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ paddingLeft: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  </Paper>
);
