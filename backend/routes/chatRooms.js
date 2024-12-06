const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/chatRoom');
const ChatMessage = require('../models/chatMessage');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');

// Configuration de multer pour les fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/chat')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Créer un nouveau salon
router.post('/', verifyToken, async (req, res) => {
    try {
        const room = new ChatRoom({
            name: req.body.name,
            description: req.body.description,
            isPrivate: req.body.isPrivate,
            admin: req.user.id,
            members: [{ user: req.user.id, role: 'admin' }]
        });

        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du salon' });
    }
});

// Obtenir tous les salons de l'utilisateur
router.get('/', verifyToken, async (req, res) => {
    try {
        const rooms = await ChatRoom.find({
            'members.user': req.user.id
        })
        .populate('admin', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email')
        .populate('lastMessage');
        
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des salons' });
    }
});

// Obtenir un salon spécifique
router.get('/:roomId', verifyToken, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId)
            .populate('admin', 'firstName lastName email')
            .populate('members.user', 'firstName lastName email')
            .populate('lastMessage');

        if (!room) {
            return res.status(404).json({ message: 'Salon non trouvé' });
        }

        const isMember = room.members.some(member => 
            member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du salon' });
    }
});

// Ajouter un membre au salon
router.post('/:roomId/members', verifyToken, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Salon non trouvé' });
        }

        if (room.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Seul l\'administrateur peut ajouter des membres' });
        }

        const newMember = {
            user: req.body.userId,
            role: req.body.role || 'member'
        };

        if (!room.members.some(member => member.user.toString() === newMember.user)) {
            room.members.push(newMember);
            await room.save();
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du membre' });
    }
});

// Envoyer un message
router.post('/:roomId/messages', verifyToken, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Salon non trouvé' });
        }

        const isMember = room.members.some(member => 
            member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Vous devez être membre du salon pour envoyer un message' });
        }

        const message = new ChatMessage({
            room: room._id,
            sender: req.user.id,
            content: req.body.content,
            type: 'text'
        });

        await message.save();
        
        room.lastMessage = message._id;
        await room.save();

        await message.populate('sender', 'firstName lastName email');
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
    }
});

// Obtenir les messages d'un salon
router.get('/:roomId/messages', verifyToken, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Salon non trouvé' });
        }

        const isMember = room.members.some(member => 
            member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const messages = await ChatMessage.find({ room: room._id })
            .populate('sender', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
    }
});

// Uploader des fichiers
router.post('/:roomId/files', verifyToken, upload.array('files', 5), async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Salon non trouvé' });
        }

        const isMember = room.members.some(member => 
            member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
        }));

        const messages = await Promise.all(files.map(file => {
            const message = new ChatMessage({
                room: room._id,
                sender: req.user.id,
                content: file.path,
                type: 'file',
                fileInfo: file
            });
            return message.save();
        }));

        room.lastMessage = messages[messages.length - 1]._id;
        await room.save();

        res.status(201).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'upload des fichiers' });
    }
});

module.exports = router;
