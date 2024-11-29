import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const ws = useWebSocket('/admin/chat');
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadRooms();

    if (ws) {
      ws.on('userOnline', handleUserOnline);
      ws.on('userOffline', handleUserOffline);
      ws.on('roomUpdate', handleRoomUpdate);
    }

    return () => {
      if (ws) {
        ws.off('userOnline');
        ws.off('userOffline');
        ws.off('roomUpdate');
      }
    };
  }, [ws]);

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      showNotification('Erreur lors du chargement des salons', 'error');
    }
  };

  const handleUserOnline = useCallback((userId) => {
    setOnlineUsers(prev => new Set([...prev, userId]));
  }, []);

  const handleUserOffline = useCallback((userId) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const handleRoomUpdate = useCallback((room) => {
    setRooms(prev =>
      prev.map(r => r._id === room._id ? room : r)
    );
  }, []);

  const createRoom = async (roomData) => {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      const room = await response.json();
      setRooms(prev => [...prev, room]);
      return room;
    } catch (error) {
      showNotification('Erreur lors de la création du salon', 'error');
      throw error;
    }
  };

  const updateRoom = async (roomId, roomData) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      const room = await response.json();
      setRooms(prev =>
        prev.map(r => r._id === roomId ? room : r)
      );
      return room;
    } catch (error) {
      showNotification('Erreur lors de la modification du salon', 'error');
      throw error;
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await fetch(`/api/chat/rooms/${roomId}`, {
        method: 'DELETE'
      });
      setRooms(prev => prev.filter(r => r._id !== roomId));
      if (currentRoom?._id === roomId) {
        setCurrentRoom(null);
      }
    } catch (error) {
      showNotification('Erreur lors de la suppression du salon', 'error');
      throw error;
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/join`, {
        method: 'POST'
      });
      const room = await response.json();
      setRooms(prev => [...prev, room]);
      return room;
    } catch (error) {
      showNotification('Erreur lors de la connexion au salon', 'error');
      throw error;
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await fetch(`/api/chat/rooms/${roomId}/leave`, {
        method: 'POST'
      });
      setRooms(prev => prev.filter(r => r._id !== roomId));
      if (currentRoom?._id === roomId) {
        setCurrentRoom(null);
      }
    } catch (error) {
      showNotification('Erreur lors de la déconnexion du salon', 'error');
      throw error;
    }
  };

  const value = {
    rooms,
    currentRoom,
    setCurrentRoom,
    onlineUsers,
    createRoom,
    updateRoom,
    deleteRoom,
    joinRoom,
    leaveRoom,
    isUserOnline: (userId) => onlineUsers.has(userId)
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
