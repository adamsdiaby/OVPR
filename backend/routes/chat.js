const express = require('express');
const router = express.Router();
const WebSocket = require('ws');
const ChatMessage = require('../models/chatMessage');
const Admin = require('../models/admin');
const auth = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

// Stocker les connexions WebSocket actives
const activeConnections = new Map();

// Middleware pour vérifier l'authentification WebSocket
const authenticateWs = async (token) => {
  try {
    const admin = await Admin.findOne({ token });
    return admin;
  } catch (error) {
    return null;
  }
};

// Configuration WebSocket
const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server, path: '/admin/chat' });

  wss.on('connection', async (ws, req) => {
    const token = req.headers['sec-websocket-protocol'];
    const admin = await authenticateWs(token);

    if (!admin) {
      ws.close();
      return;
    }

    activeConnections.set(admin._id.toString(), ws);

    // Mettre à jour le statut en ligne
    await Admin.findByIdAndUpdate(admin._id, { isOnline: true });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);
        const chatMessage = await ChatMessage.create({
          sender: admin._id,
          content: message.content,
          mentions: message.mentions,
          isUrgent: message.isUrgent
        });

        // Diffuser le message à tous les admins connectés
        const broadcastMessage = {
          type: 'message',
          data: await chatMessage.populate('sender', 'nom prenom role')
        };

        for (const [adminId, connection] of activeConnections) {
          if (connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(broadcastMessage));
          }
        }

        // Notifier les admins mentionnés
        if (message.mentions && message.mentions.length > 0) {
          for (const mentionedAdminId of message.mentions) {
            await NotificationService.createNotification({
              recipient: mentionedAdminId,
              type: 'mention',
              title: 'Vous avez été mentionné',
              message: `${admin.nom} ${admin.prenom} vous a mentionné dans un message`,
              priority: message.isUrgent ? 'high' : 'medium'
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message:', error);
      }
    });

    ws.on('close', async () => {
      activeConnections.delete(admin._id.toString());
      await Admin.findByIdAndUpdate(admin._id, { isOnline: false });
    });
  });
};

// Routes HTTP

// Récupérer les messages récents
router.get('/messages', auth, async (req, res) => {
  try {
    const messages = await ChatMessage.getRecentMessages(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// Envoyer un nouveau message
router.post('/messages', auth, async (req, res) => {
  try {
    const message = await ChatMessage.create({
      sender: req.admin._id,
      content: req.body.content,
      mentions: req.body.mentions,
      isUrgent: req.body.isUrgent
    });

    const populatedMessage = await message.populate('sender', 'nom prenom role');

    // Diffuser via WebSocket
    for (const [adminId, ws] of activeConnections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'message',
          data: populatedMessage
        }));
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
});

// Marquer un message comme lu
router.put('/messages/:id/read', auth, async (req, res) => {
  try {
    const message = await ChatMessage.markAsRead(req.params.id, req.admin._id);
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du marquage du message' });
  }
});

// Récupérer les admins en ligne
router.get('/online', auth, async (req, res) => {
  try {
    const onlineAdmins = await Admin.find(
      { isOnline: true },
      'nom prenom role lastSeen'
    );
    res.json(onlineAdmins);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des admins en ligne' });
  }
});

module.exports = {
  router,
  setupWebSocket
};
