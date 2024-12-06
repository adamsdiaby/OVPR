import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  ListAlt as ListAltIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  BarChart as BarChartIcon,
  Chat as ChatIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 220;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    borderRight: '1px solid #e0e0e0',
    boxShadow: 'none',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: '2px 8px',
  borderRadius: '4px',
  height: '40px',
  backgroundColor: active ? theme.palette.primary.light : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active 
      ? theme.palette.primary.light 
      : 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
    minWidth: 35,
    '& svg': {
      fontSize: '1.2rem',
    }
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
  }
}));

const menuItems = [
  { 
    category: 'PRINCIPAL',
    items: [
      { text: 'Accueil', icon: HomeIcon, path: '/admin/dashboard', description: 'Vue d\'ensemble et statistiques' },
      { text: 'Annonces', icon: ListAltIcon, path: '/admin/annonces', description: 'Gestion des annonces',
        subItems: [
          { text: 'Toutes les annonces', path: '/admin/annonces/all' },
          { text: 'Signalements', path: '/admin/annonces/reports' },
          { text: 'Nouvelles annonces', path: '/admin/annonces/new' }
        ]
      },
      { text: 'Utilisateurs', icon: PeopleIcon, path: '/admin/users', description: 'Gestion des utilisateurs',
        subItems: [
          { text: 'Tous les utilisateurs', path: '/admin/users/all' },
          { text: 'Rôles et permissions', path: '/admin/users/roles' },
          { text: 'Suspensions', path: '/admin/users/suspended' }
        ]
      },
      { text: 'Police/Gendarmerie', icon: SecurityIcon, path: '/admin/police', description: 'Gestion des forces de l\'ordre',
        subItems: [
          { text: 'Liste des comptes', path: '/admin/police/accounts' },
          { text: 'Correspondance', path: '/admin/police/correspondence' },
          { text: 'Vérifications', path: '/admin/police/verifications' }
        ]
      }
    ]
  },
  {
    category: 'OUTILS',
    items: [
      { text: 'Statistiques', icon: BarChartIcon, path: '/admin/statistics', description: 'Analyses et rapports' },
      { text: 'Messages', icon: ChatIcon, path: '/admin/messages', description: 'Centre de messagerie' },
      { text: 'Historique', icon: HistoryIcon, path: '/admin/history', description: 'Journal d\'activité' },
      { text: 'Notifications', icon: NotificationsIcon, path: '/admin/notifications', description: 'Centre de notifications' }
    ]
  },
  {
    category: 'SYSTÈME',
    items: [
      { text: 'Paramètres', icon: SettingsIcon, path: '/admin/settings', description: 'Configuration du système' },
      { text: 'Assistance', icon: HelpIcon, path: '/admin/help', description: 'Aide et support' },
      { text: 'Déconnexion', icon: ExitToAppIcon, path: '/logout', description: 'Quitter la session' }
    ]
  }
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      onClose={onClose}
    >
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        height: 64,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box 
          component="img"
          src="/logo.png"
          alt="OVPR Logo"
          sx={{ 
            height: 35,
            width: 'auto',
            mr: 1
          }}
        />
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            fontSize: '1.1rem'
          }}
        >
          OVPR Admin
        </Typography>
      </Box>

      <Box sx={{ overflow: 'auto', mt: 1 }}>
        {menuItems.map((category) => (
          <Box key={category.category}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                py: 2,
                display: 'block',
                color: 'text.secondary',
                fontWeight: 600,
              }}
            >
              {category.category}
            </Typography>
            <List sx={{ p: 1 }}>
              {category.items.map((item) => (
                <React.Fragment key={item.text}>
                  <StyledListItem
                    active={location.pathname === item.path ? 1 : 0}
                    onClick={() => navigate(item.path)}
                    button
                  >
                    <ListItemIcon>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: location.pathname === item.path ? 600 : 400,
                      }}
                    />
                  </StyledListItem>
                  {item.subItems && (
                    <List sx={{ pl: 4 }}>
                      {item.subItems.map((subItem) => (
                        <StyledListItem
                          key={subItem.text}
                          active={location.pathname === subItem.path ? 1 : 0}
                          onClick={() => navigate(subItem.path)}
                          button
                        >
                          <ListItemText 
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: location.pathname === subItem.path ? 600 : 400,
                            }}
                          />
                        </StyledListItem>
                      ))}
                    </List>
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;
