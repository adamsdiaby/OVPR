import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Announcement as AnnouncementIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  List as ListIcon,
  Message as MessageIcon,
  VerifiedUser as VerifiedUserIcon,
  ExpandMore,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Annonces', icon: <AnnouncementIcon />, path: '/admin/annonces' },
  {
    text: 'Police/Gendarmerie',
    icon: <SecurityIcon />,
    subItems: [
      { text: 'Liste des comptes', path: '/admin/police/accounts' },
      { text: 'Correspondance', path: '/admin/police/correspondence' },
      { text: 'Vérifications', path: '/admin/police/verifications' }
    ]
  },
  {
    text: 'OUTILS',
    icon: <BuildIcon />,
    subItems: [
      { text: 'Statistiques', icon: <AssessmentIcon />, path: '/admin/tools/statistics' },
      { text: 'Messages', icon: <MessageIcon />, path: '/admin/tools/messages' },
      { text: 'Historique', icon: <HistoryIcon />, path: '/admin/tools/history' },
      { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/tools/notifications' }
    ]
  },
  { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings' }
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [notificationCount] = useState(5);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (item) => {
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.text ? null : item.text);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubMenuClick = (e, path) => {
    e.stopPropagation(); // Empêche la propagation au parent
    navigate(path);
  };

  const isMenuActive = (path) => {
    return location.pathname === path;
  };

  const isSubMenuActive = (item) => {
    return item.subItems?.some(subItem => location.pathname === subItem.path);
  };

  const handleLogout = () => {
    // Implémentez la logique de déconnexion ici
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'primary.main',
          boxShadow: 1,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{ height: 40, mr: 2 }}
          />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            OVPR Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton sx={{ ml: 2 }}>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem
                button
                onClick={() => handleMenuClick(item)}
                sx={{
                  bgcolor: (isMenuActive(item.path) || isSubMenuActive(item)) ? 'action.selected' : 'inherit'
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subItems && (
                  <ExpandMore 
                    sx={{ 
                      transform: expandedMenu === item.text ? 'rotate(180deg)' : 'none',
                      transition: '0.3s'
                    }} 
                  />
                )}
              </ListItem>
              {item.subItems && expandedMenu === item.text && (
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem
                      key={subItem.text}
                      button
                      onClick={(e) => handleSubMenuClick(e, subItem.path)}
                      sx={{
                        pl: 4,
                        bgcolor: isMenuActive(subItem.path) ? 'action.selected' : 'inherit'
                      }}
                    >
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </ListItem>
                  ))}
                </List>
              )}
            </React.Fragment>
          ))}
        </List>
        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
};

export default Layout;
