const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String,
    url: String,
    name: String,
    size: Number
  }],
  readBy: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Index pour améliorer les performances
chatMessageSchema.index({ createdAt: -1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });
chatMessageSchema.index({ mentions: 1 });

// Méthodes statiques
chatMessageSchema.statics.getRecentMessages = async function(limit = 50) {
  return await this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'nom prenom role')
    .populate('mentions', 'nom prenom')
    .populate('readBy.admin', 'nom prenom');
};

chatMessageSchema.statics.markAsRead = async function(messageId, adminId) {
  return await this.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        readBy: {
          admin: adminId,
          readAt: new Date()
        }
      }
    },
    { new: true }
  );
};

// Méthodes d'instance
chatMessageSchema.methods.isReadBy = function(adminId) {
  return this.readBy.some(read => read.admin.equals(adminId));
};

chatMessageSchema.methods.addMention = async function(adminId) {
  if (!this.mentions.includes(adminId)) {
    this.mentions.push(adminId);
    return await this.save();
  }
  return this;
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
