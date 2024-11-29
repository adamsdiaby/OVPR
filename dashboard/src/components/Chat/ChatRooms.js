import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LeaveIcon
} from '@mui/icons-material';

const ChatRooms = ({
  rooms,
  currentRoom,
  onRoomSelect,
  onRoomCreate,
  onRoomEdit,
  onRoomDelete,
  onRoomLeave,
  currentUser
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    isPrivate: false,
    members: []
  });

  const handleMenuClick = (event, room) => {
    event.stopPropagation();
    setSelectedRoom(room);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setRoomForm({
      name: '',
      description: '',
      isPrivate: false,
      members: []
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = () => {
    setRoomForm({
      name: selectedRoom.name,
      description: selectedRoom.description,
      isPrivate: selectedRoom.isPrivate,
      members: selectedRoom.members
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onRoomDelete(selectedRoom._id);
    handleMenuClose();
  };

  const handleLeaveClick = () => {
    onRoomLeave(selectedRoom._id);
    handleMenuClose();
  };

  const handleSubmit = (isEdit) => {
    if (isEdit) {
      onRoomEdit(selectedRoom._id, roomForm);
      setEditDialogOpen(false);
    } else {
      onRoomCreate(roomForm);
      setCreateDialogOpen(false);
    }
    setRoomForm({
      name: '',
      description: '',
      isPrivate: false,
      members: []
    });
  };

  const isRoomAdmin = (room) => {
    return room.admin === currentUser._id;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Salons</Typography>
        <IconButton onClick={handleCreateClick} size="small">
          <AddIcon />
        </IconButton>
      </Box>

      <List>
        {rooms.map((room) => (
          <ListItem
            key={room._id}
            button
            selected={currentRoom?._id === room._id}
            onClick={() => onRoomSelect(room)}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="room settings"
                onClick={(e) => handleMenuClick(e, room)}
              >
                <MoreVertIcon />
              </IconButton>
            }
          >
            <ListItemIcon>
              {room.isPrivate ? <LockIcon /> : <PublicIcon />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{room.name}</Typography>
                  {room.unreadCount > 0 && (
                    <Badge
                      badgeContent={room.unreadCount}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
              secondary={room.description}
            />
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isRoomAdmin(selectedRoom) && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
        )}
        {isRoomAdmin(selectedRoom) && (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Supprimer</ListItemText>
          </MenuItem>
        )}
        {!isRoomAdmin(selectedRoom) && (
          <MenuItem onClick={handleLeaveClick}>
            <ListItemIcon>
              <LeaveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Quitter</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Dialog de création/modification */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editDialogOpen ? 'Modifier le salon' : 'Créer un nouveau salon'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nom du salon"
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Salon privé</Typography>
              <IconButton
                onClick={() => setRoomForm({ ...roomForm, isPrivate: !roomForm.isPrivate })}
                color={roomForm.isPrivate ? 'primary' : 'default'}
              >
                {roomForm.isPrivate ? <LockIcon /> : <PublicIcon />}
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => handleSubmit(editDialogOpen)}
            variant="contained"
            disabled={!roomForm.name}
          >
            {editDialogOpen ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatRooms;
