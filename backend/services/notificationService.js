const WebSocket = require('ws');
const Admin = require('../models/admin');
const Notification = require('../models/notification');
const ChatRoom = require('../models/chatRoom');

class NotificationService {
  constructor() {
    this.connections = new Map();
    this.wss = null;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: '/notifications' });

    this.wss.on('connection', async (ws, req) => {
      const token = req.headers['sec-websocket-protocol'];
      const admin = await this.authenticateConnection(token);

      if (!admin) {
        ws.close();
        return;
      }

      this.handleConnection(ws, admin);
    });
  }

  async authenticateConnection(token) {
    try {
      const admin = await Admin.findOne({ token });
      return admin;
    } catch (error) {
      console.error('Erreur d\'authentification WebSocket:', error);
      return null;
    }
  }

  handleConnection(ws, admin) {
    this.connections.set(admin._id.toString(), ws);

    ws.on('close', () => {
      this.connections.delete(admin._id.toString());
      Admin.findByIdAndUpdate(admin._id, { isOnline: false })
        .catch(err => console.error('Erreur de mise à jour du statut:', err));
    });

    Admin.findByIdAndUpdate(admin._id, { isOnline: true })
      .catch(err => console.error('Erreur de mise à jour du statut:', err));
  }

  async sendNotification(recipientId, notification) {
    try {
      const ws = this.connections.get(recipientId.toString());
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      }

      // Sauvegarder la notification dans la base de données
      await this.saveNotification(recipientId, notification);
    } catch (error) {
      console.error('Erreur d\'envoi de notification:', error);
    }
  }

  async sendToRoom(roomId, event, data, excludeUser = null) {
    try {
      const room = await ChatRoom.findById(roomId)
        .populate('members.user', '_id');

      for (const member of room.members) {
        if (excludeUser && member.user._id.equals(excludeUser)) continue;

        const ws = this.connections.get(member.user._id.toString());
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: event, data }));
        }
      }
    } catch (error) {
      console.error('Erreur d\'envoi au salon:', error);
    }
  }

  async broadcastToAll(event, data, excludeUser = null) {
    for (const [userId, ws] of this.connections) {
      if (excludeUser && userId === excludeUser.toString()) continue;

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: event, data }));
      }
    }
  }

  async saveNotification(recipientId, notification) {
    try {
      const newNotification = new Notification({
        recipient: recipientId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority || 'normal'
      });

      await newNotification.save();
      return newNotification;
    } catch (error) {
      console.error('Erreur de sauvegarde de notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipient: userId,
        read: false
      });
    } catch (error) {
      console.error('Erreur de comptage des notifications:', error);
      return 0;
    }
  }

  isUserOnline(userId) {
    return this.connections.has(userId.toString());
  }

  getOnlineUsers() {
    return Array.from(this.connections.keys());
  }
}

// Créer une instance unique du service
const notificationService = new NotificationService();

module.exports = notificationService;
