const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  unreadCounts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes pour améliorer les performances
chatRoomSchema.index({ name: 'text', description: 'text' });
chatRoomSchema.index({ admin: 1 });
chatRoomSchema.index({ 'members.user': 1 });

// Méthodes statiques
chatRoomSchema.statics.getUserRooms = async function(userId) {
  return this.find({
    'members.user': userId
  })
  .populate('admin', 'nom prenom role')
  .populate('lastMessage')
  .populate('members.user', 'nom prenom role');
};

chatRoomSchema.statics.addMember = async function(roomId, userId) {
  return this.findByIdAndUpdate(
    roomId,
    {
      $addToSet: {
        members: { user: userId },
        unreadCounts: { user: userId, count: 0 }
      }
    },
    { new: true }
  );
};

// Méthodes d'instance
chatRoomSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.equals(userId));
};

chatRoomSchema.methods.isAdmin = function(userId) {
  return this.admin.equals(userId);
};

chatRoomSchema.methods.updateUnreadCount = async function(userId, increment = true) {
  const unreadCount = this.unreadCounts.find(
    count => count.user.equals(userId)
  );

  if (unreadCount) {
    unreadCount.count = increment ? unreadCount.count + 1 : 0;
  } else {
    this.unreadCounts.push({ user: userId, count: increment ? 1 : 0 });
  }

  return this.save();
};

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
