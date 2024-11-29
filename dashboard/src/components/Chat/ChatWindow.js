import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Badge,
  Tooltip,
  CircularProgress,
  Grid,
  Stack
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  EmojiEmotions as EmojiIcon,
  PushPinIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EmojiPicker from './EmojiPicker';
import FileUpload from './FileUpload';
import ChatSearch from './ChatSearch';
import MessageReactions from './MessageReactions';
import TypingIndicator from './TypingIndicator';
import PinnedMessages from './PinnedMessages';
import OnlineUsers from './OnlineUsers';
import ChatStats from './ChatStats';
import useWebSocket from '../../hooks/useWebSocket';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import debounce from 'lodash.debounce';
import MessageFilters from './MessageFilters';
import ConnectionHistory from './ConnectionHistory';
import { MentionSystem, MentionText } from './MentionSystem';
import MediaPreview from './MediaPreview';

const ChatWindow = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const messageInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const ws = useWebSocket(`/chat/${roomId}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (roomId) {
      loadMessages();
      loadPinnedMessages();
    }
  }, [roomId]);

  const handleNewMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
    scrollToBottom();
  }, []);

  const handleReaction = useCallback((reaction) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg._id === reaction.messageId
          ? { ...msg, reactions: { ...msg.reactions, ...reaction.reactions } }
          : msg
      )
    );
  }, []);

  const handleTyping = useCallback((data) => {
    if (data.typing) {
      setTypingUsers(prev => [...prev, data.userId]);
    } else {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    }
  }, []);

  const handlePinnedMessage = useCallback((data) => {
    if (data.pinned) {
      setPinnedMessages(prev => [...prev, data.message]);
    } else {
      setPinnedMessages(prev => prev.filter(msg => msg._id !== data.message._id));
    }
  }, []);

  const handleMessageEdit = useCallback((editedMessage) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg._id === editedMessage._id ? editedMessage : msg
      )
    );
  }, []);

  const handleMessageDelete = useCallback((deletedMessageId) => {
    setMessages(prevMessages => 
      prevMessages.filter(msg => msg._id !== deletedMessageId)
    );
  }, []);

  useEffect(() => {
    if (ws) {
      ws.on('message', handleNewMessage);
      ws.on('reaction', handleReaction);
      ws.on('typing', handleTyping);
      ws.on('pinned', handlePinnedMessage);
      ws.on('messageEdit', handleMessageEdit);
      ws.on('messageDelete', handleMessageDelete);
    }

    return () => {
      if (ws) {
        ws.off('message');
        ws.off('reaction');
        ws.off('typing');
        ws.off('pinned');
        ws.off('messageEdit');
        ws.off('messageDelete');
      }
    };
  }, [roomId, ws]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      showNotification('Erreur lors du chargement des messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPinnedMessages = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/pinned-messages`);
      const data = await response.json();
      setPinnedMessages(data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages épinglés:', error);
    }
  };

  const sendTypingStatus = useCallback(
    debounce(() => {
      ws.send({ type: 'typing', typing: true });
      setTimeout(() => {
        ws.send({ type: 'typing', typing: false });
      }, 3000);
    }, 500),
    [ws]
  );

  const pinMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/pin`, {
        method: 'POST'
      });
      const pinnedMessage = await response.json();
      setPinnedMessages(prev => [...prev, pinnedMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'épinglage du message:', error);
    }
  };

  const unpinMessage = async (messageId) => {
    try {
      await fetch(`/api/chat/messages/${messageId}/unpin`, {
        method: 'DELETE'
      });
      setPinnedMessages(prev =>
        prev.filter(msg => msg._id !== messageId)
      );
    } catch (error) {
      console.error('Erreur lors du désépinglage du message:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const payload = {
        content: message,
        roomId,
        replyTo: replyTo?._id,
      };

      if (editMessage) {
        await fetch(`/api/chat/messages/${editMessage._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setMessage('');
      setReplyTo(null);
      setEditMessage(null);
    } catch (error) {
      showNotification('Erreur lors de l\'envoi du message', 'error');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const handleFileSelect = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/chat/rooms/${roomId}/files`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      // Créer un message avec les pièces jointes
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          content: 'Fichiers partagés',
          attachments: data
        })
      });
    } catch (error) {
      showNotification('Erreur lors du téléchargement des fichiers', 'error');
    }
  };

  const handleMessageMenu = (event, message) => {
    event.preventDefault();
    setSelectedMessage(message);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMessage(null);
  };

  const handleEdit = () => {
    setEditMessage(selectedMessage);
    setMessage(selectedMessage.content);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/chat/messages/${selectedMessage._id}`, {
        method: 'DELETE'
      });
      handleMenuClose();
    } catch (error) {
      showNotification('Erreur lors de la suppression du message', 'error');
    }
  };

  const handleReply = () => {
    setReplyTo(selectedMessage);
    handleMenuClose();
  };

  const handleFilter = (filters) => {
    if (!filters) {
      setFilteredMessages(null);
      return;
    }

    const filtered = messages.filter(message => {
      if (filters.text && !message.content.toLowerCase().includes(filters.text.toLowerCase())) {
        return false;
      }
      if (filters.user && !message.user.nom.toLowerCase().includes(filters.user.toLowerCase())) {
        return false;
      }
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const messageDate = new Date(message.createdAt);
        if (messageDate < filters.dateRange[0] || messageDate > filters.dateRange[1]) {
          return false;
        }
      }
      if (filters.type !== 'all') {
        if (filters.type === 'file' && !message.attachments?.length) {
          return false;
        }
        if (filters.type === 'image' && !message.attachments?.some(a => a.type === 'image')) {
          return false;
        }
      }
      if (filters.hasAttachments && !message.attachments?.length) {
        return false;
      }
      if (filters.hasReactions && !message.reactions?.length) {
        return false;
      }
      if (filters.isPinned && !message.isPinned) {
        return false;
      }
      return true;
    });

    setFilteredMessages(filtered);
  };

  const handleMention = (user) => {
    ws.send({
      type: 'mention',
      userId: user._id,
      roomId
    });
  };

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      <Grid item xs={12} md={3}>
        <Stack spacing={2}>
          <MessageFilters onFilter={handleFilter} />
          <ConnectionHistory />
        </Stack>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {pinnedMessages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <PinnedMessages
                messages={pinnedMessages}
                onUnpin={unpinMessage}
              />
            </Box>
          )}
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
            {(filteredMessages || messages).map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                onReact={handleReaction}
                onPin={pinMessage}
                onMediaClick={handleMediaClick}
                users={messages.map(msg => msg.user)}
                onMentionClick={handleMention}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>
          
          <TypingIndicator users={typingUsers} />
          
          <Box sx={{ p: 2 }}>
            <MentionSystem
              inputRef={messageInputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              users={messages.map(msg => msg.user)}
              onMention={handleMention}
            />
            <FileUpload onFileSelect={handleFileSelect} />
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2
              }}
            >
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={3}>
        <Stack spacing={2}>
          <OnlineUsers />
          <ChatStats />
        </Stack>
      </Grid>

      {selectedMedia && (
        <MediaPreview
          media={[selectedMedia]}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </Grid>
  );
};

const MessageItem = ({ message, onReact, onPin, onMediaClick, users, onMentionClick }) => (
  <Box
    sx={{
      display: 'flex',
      mb: 2,
      alignItems: 'flex-start'
    }}
  >
    <Avatar
      src={message.user.avatar}
      alt={message.user.nom}
      sx={{ mr: 2 }}
    >
      {message.user.nom[0]}
    </Avatar>

    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="subtitle2">
          {message.user.nom}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(message.createdAt), 'HH:mm')}
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 1 }}>
        <MentionText
          text={message.content}
          users={users}
          onMentionClick={onMentionClick}
        />
      </Typography>

      {message.attachments?.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {message.attachments.map((attachment, index) => (
            <Box
              key={index}
              sx={{ width: 200 }}
              onClick={() => onMediaClick(attachment)}
            >
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover'
                  }}
                >
                  <Typography>{attachment.name}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <MessageReactions
        message={message}
        onReact={onReact}
      />
    </Box>

    <IconButton
      size="small"
      onClick={() => onPin(message._id)}
      sx={{ ml: 1 }}
    >
      <PushPinIcon fontSize="small" />
    </IconButton>
  </Box>
);

export default ChatWindow;
