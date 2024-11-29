const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/chatRoom');
const ChatMessage = require('../models/chatMessage');
const auth = require('../middleware/auth');
const { upload, FileService } = require('../services/fileService');

// Créer un nouveau salon
router.post('/', auth, async (req, res) => {
  try {
    const room = new ChatRoom({
      name: req.body.name,
      description: req.body.description,
      isPrivate: req.body.isPrivate,
      admin: req.admin._id,
      members: [{ user: req.admin._id, role: 'admin' }]
    });

    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du salon' });
  }
});

// Obtenir tous les salons de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await ChatRoom.getUserRooms(req.admin._id);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des salons' });
  }
});

// Obtenir un salon spécifique
router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate('admin', 'nom prenom role')
      .populate('members.user', 'nom prenom role')
      .populate('lastMessage');

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    if (!room.isMember(req.admin._id)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du salon' });
  }
});

// Modifier un salon
router.put('/:roomId', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    if (!room.isAdmin(req.admin._id)) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      {
        name: req.body.name,
        description: req.body.description,
        isPrivate: req.body.isPrivate
      },
      { new: true }
    );

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification du salon' });
  }
});

// Supprimer un salon
router.delete('/:roomId', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    if (!room.isAdmin(req.admin._id)) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    await ChatMessage.deleteMany({ room: req.params.roomId });
    await room.remove();

    res.json({ message: 'Salon supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du salon' });
  }
});

// Ajouter un membre
router.post('/:roomId/members', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    if (!room.isAdmin(req.admin._id)) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    const updatedRoom = await ChatRoom.addMember(req.params.roomId, req.body.userId);
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du membre' });
  }
});

// Supprimer un membre
router.delete('/:roomId/members/:userId', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    if (!room.isAdmin(req.admin._id)) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      {
        $pull: {
          members: { user: req.params.userId },
          unreadCounts: { user: req.params.userId }
        }
      },
      { new: true }
    );

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du membre' });
  }
});

// Marquer comme lu
router.post('/:roomId/read', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    await room.updateUnreadCount(req.admin._id, false);
    res.json({ message: 'Messages marqués comme lus' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// Upload de fichier dans un salon
router.post('/:roomId/files', auth, upload.array('files', 5), async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Salon non trouvé' });
    }

    if (!room.isMember(req.admin._id)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const fileInfos = await Promise.all(
      req.files.map(file => FileService.saveFile(file))
    );

    res.json(fileInfos);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'upload des fichiers' });
  }
});

module.exports = router;
