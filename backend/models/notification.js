const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  type: {
    type: String,
    enum: ['admin_validation', 'alert', 'validation', 'rejection', 'info'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  actionLink: {
    type: String
  },
  actionData: {
    type: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthodes statiques
notificationSchema.statics.createNotification = async function(data) {
  return await this.create(data);
};

notificationSchema.statics.getUnreadCount = async function(recipientId) {
  return await this.countDocuments({
    recipient: recipientId,
    read: false
  });
};

// Méthodes d'instance
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return await this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
