import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import Sidebar from '../../pages/AdminDashboard/components/Sidebar/Sidebar';
import Header from '../../pages/AdminDashboard/components/Header/Header';

const SharedLayout = ({ children }) => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onDrawerToggle={handleDrawerToggle} />
      <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          marginTop: '64px', // Pour compenser la hauteur de l'AppBar
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SharedLayout;
