import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = React.useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClick = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  return (
    <StyledAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationsClick}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Profile */}
        <Tooltip title="Profile">
          <IconButton
            size="large"
            edge="end"
            onClick={handleProfileClick}
            color="inherit"
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 },
          }}
        >
          <MenuItem>
            <Typography variant="subtitle2">Nouvelle annonce créée</Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="subtitle2">Nouveau signalement reçu</Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="subtitle2">Paiement reçu</Typography>
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 200 },
          }}
        >
          <MenuItem onClick={handleClose}>
            <PersonIcon sx={{ mr: 2 }} />
            <Typography>Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <SettingsIcon sx={{ mr: 2 }} />
            <Typography>Paramètres</Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <LogoutIcon sx={{ mr: 2 }} />
            <Typography>Déconnexion</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
