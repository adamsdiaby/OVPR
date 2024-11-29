import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Popper,
  Fade,
  ClickAwayListener
} from '@mui/material';
import { styled } from '@mui/material/styles';

const MentionHighlight = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  padding: '2px 4px',
  borderRadius: 4,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const MentionPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
  width: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
}));

const MentionSystem = ({ inputRef, value, onChange, users, onMention }) => {
  const [mentionAnchor, setMentionAnchor] = useState(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const lastMentionIndex = useRef(-1);

  useEffect(() => {
    if (mentionSearch) {
      const filtered = users.filter(user =>
        user.nom.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        user.prenom.toLowerCase().includes(mentionSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [mentionSearch, users]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    const cursorPos = event.target.selectionStart;
    setCursorPosition(cursorPos);

    // Détecter si on commence une mention
    const beforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const rect = inputRef.current.getBoundingClientRect();
      const mentionStart = mentionMatch.index;
      lastMentionIndex.current = mentionStart;
      
      // Calculer la position du popper
      const textBeforeMention = beforeCursor.slice(0, mentionStart);
      const dummySpan = document.createElement('span');
      dummySpan.style.font = window.getComputedStyle(inputRef.current).font;
      dummySpan.textContent = textBeforeMention;
      document.body.appendChild(dummySpan);
      const offset = dummySpan.getBoundingClientRect().width;
      document.body.removeChild(dummySpan);

      setMentionAnchor({
        getBoundingClientRect: () => ({
          top: rect.top,
          left: rect.left + offset,
          right: rect.left + offset,
          bottom: rect.bottom,
          width: 0,
          height: rect.height,
        }),
      });
      setMentionSearch(mentionMatch[1]);
    } else {
      setMentionAnchor(null);
      setMentionSearch('');
    }

    onChange(event);
  };

  const insertMention = (user) => {
    const beforeMention = value.slice(0, lastMentionIndex.current);
    const afterMention = value.slice(cursorPosition);
    const mention = `@${user.nom} `;
    const newValue = beforeMention + mention + afterMention;
    
    onChange({
      target: {
        value: newValue
      }
    });

    // Notifier le parent de la mention
    if (onMention) {
      onMention(user);
    }

    setMentionAnchor(null);
    setMentionSearch('');

    // Placer le curseur après la mention
    setTimeout(() => {
      const newCursorPos = lastMentionIndex.current + mention.length;
      inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleClickAway = () => {
    setMentionAnchor(null);
    setMentionSearch('');
  };

  return (
    <>
      <MentionPopper
        open={Boolean(mentionAnchor)}
        anchorEl={mentionAnchor}
        placement="bottom-start"
        transition
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps}>
              <Paper>
                {filteredUsers.length > 0 ? (
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {filteredUsers.map(user => (
                      <ListItem
                        key={user._id}
                        button
                        onClick={() => insertMention(user)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={`${user.nom} ${user.prenom}`}
                            src={user.avatar}
                          >
                            {user.nom[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.nom} ${user.prenom}`}
                          secondary={user.role}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary">
                      Aucun utilisateur trouvé
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </MentionPopper>
    </>
  );
};

export const MentionText = ({ text, users, onMentionClick }) => {
  const parts = text.split(/(@\w+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          const user = users.find(u => u.nom === username);
          
          if (user) {
            return (
              <MentionHighlight
                key={index}
                onClick={() => onMentionClick?.(user)}
              >
                {part}
              </MentionHighlight>
            );
          }
        }
        return part;
      })}
    </>
  );
};

export default MentionSystem;
