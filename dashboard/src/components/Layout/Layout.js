import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Announcement as AnnouncementIcon,
  Flag as FlagIcon,
  People as PeopleIcon,
  BarChart as StatsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationCenter from '../Notifications/NotificationCenter';
import Tooltip from '@mui/material/Tooltip';

const drawerWidth = 240;

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Annonces', icon: <AnnouncementIcon />, path: '/admin/annonces' },
  { text: 'Signalements', icon: <FlagIcon />, path: '/admin/signalements' },
  { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/utilisateurs' },
  { text: 'Statistiques', icon: <StatsIcon />, path: '/admin/statistiques' },
  { text: 'Configuration', icon: <SettingsIcon />, path: '/admin/configuration' },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="primary">OVPR Admin</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.contrastText,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : theme.palette.text.primary }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationCenter 
              onNotificationClick={(notification) => {
                if (notification.actionLink) {
                  navigate(notification.actionLink, { state: notification.actionData });
                }
              }} 
            />
            <Tooltip title="Paramètres du compte">
              <IconButton color="primary">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <IconButton color="primary">
              <LanguageIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
