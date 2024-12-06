const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'uploads/annonces';
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WEBP.'), false);
    }
};

// Configuration de l'upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Route pour uploader une ou plusieurs images
router.post('/images', verifyToken, upload.array('images', 10), async(req, res) => {
    try {
        const files = req.files;
        const uploadedFiles = files.map(file => ({
            filename: file.filename,
            path: `/uploads/annonces/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            message: 'Images téléchargées avec succès',
            files: uploadedFiles
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors du téléchargement des images',
            error: error.message
        });
    }
});

// Route pour supprimer une image
router.delete('/images/:filename', verifyToken, async(req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join('uploads/annonces', filename);

        // Vérifier si le fichier existe
        if (fs.existsSync(filepath)) {
            // Supprimer le fichier
            fs.unlinkSync(filepath);
            res.json({ message: 'Image supprimée avec succès' });
        } else {
            res.status(404).json({ message: 'Image non trouvée' });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la suppression de l\'image',
            error: error.message
        });
    }
});

module.exports = router;