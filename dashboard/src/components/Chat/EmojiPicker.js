import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Box, IconButton, Popover, Tab, Tabs, TextField, Typography, useTheme } from '@mui/material';
import { EmojiEmotions as EmojiIcon, AccessTime as RecentIcon, Search as SearchIcon } from '@mui/icons-material';

const EmojiPicker = ({ onEmojiSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState(0);
  const theme = useTheme();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji.native);
    // Sauvegarder dans les emojis récents
    const recentEmojis = JSON.parse(localStorage.getItem('recentEmojis') || '[]');
    if (!recentEmojis.includes(emoji.native)) {
      recentEmojis.unshift(emoji.native);
      if (recentEmojis.length > 36) {
        recentEmojis.pop();
      }
      localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis));
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'emoji-popover' : undefined;

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <EmojiIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: 350,
            maxHeight: 450
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="emoji tabs"
            sx={{ mb: 2 }}
          >
            <Tab
              icon={<EmojiIcon />}
              aria-label="all emojis"
              sx={{ minWidth: 'auto' }}
            />
            <Tab
              icon={<RecentIcon />}
              aria-label="recent emojis"
              sx={{ minWidth: 'auto' }}
            />
          </Tabs>

          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mb: 2 }}
          />

          {currentTab === 0 ? (
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme={theme.palette.mode}
              searchString={searchQuery}
              skinTonePosition="none"
              previewPosition="none"
              navPosition="none"
              perLine={8}
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 1
              }}
            >
              {JSON.parse(localStorage.getItem('recentEmojis') || '[]').map((emoji, index) => (
                <IconButton
                  key={index}
                  onClick={() => {
                    onEmojiSelect(emoji);
                    handleClose();
                  }}
                  size="small"
                >
                  <Typography variant="body1">{emoji}</Typography>
                </IconButton>
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default EmojiPicker;
