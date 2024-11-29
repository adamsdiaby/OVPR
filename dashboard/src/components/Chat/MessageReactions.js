import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { AddReaction as AddReactionIcon } from '@mui/icons-material';

const REACTIONS = [
  { emoji: '👍', name: 'thumbs_up' },
  { emoji: '❤️', name: 'heart' },
  { emoji: '😊', name: 'smile' },
  { emoji: '🎉', name: 'party' },
  { emoji: '👏', name: 'clap' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '💯', name: 'hundred' },
  { emoji: '🤔', name: 'thinking' }
];

const MessageReactions = ({ message, onReact }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReaction = (reaction) => {
    onReact(message._id, reaction);
    handleClose();
  };

  const renderReactionCount = (reaction) => {
    const count = message.reactions?.filter(r => r.name === reaction.name).length || 0;
    if (count === 0) return null;

    return (
      <Tooltip
        key={reaction.name}
        title={`${count} ${reaction.name}`}
        placement="top"
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: '12px',
            px: 1,
            py: 0.5,
            mr: 0.5,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.selected'
            }
          }}
          onClick={() => handleReaction(reaction)}
        >
          {reaction.emoji} {count}
        </Box>
      </Tooltip>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        {REACTIONS.map(reaction => renderReactionCount(reaction))}
        
        <Tooltip title="Ajouter une réaction">
          <IconButton size="small" onClick={handleClick}>
            <AddReactionIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 1 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            onChange={(_, reaction) => reaction && handleReaction(reaction)}
          >
            {REACTIONS.map(reaction => (
              <ToggleButton
                key={reaction.name}
                value={reaction}
                sx={{
                  fontSize: '1.2rem',
                  p: 1,
                  minWidth: 'auto'
                }}
              >
                {reaction.emoji}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Paper>
      </Popover>
    </>
  );
};

export default MessageReactions;
