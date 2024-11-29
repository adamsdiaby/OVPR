const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    const today = new Date();
    const yearMonth = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const targetDir = path.join(uploadDir, yearMonth);

    try {
      await fs.mkdir(targetDir, { recursive: true });
      cb(null, targetDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    // Texte
    'text/plain',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Maximum 5 fichiers à la fois
  }
});

class FileService {
  static async saveFile(file) {
    const fileInfo = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: new Date()
    };

    // Vous pouvez sauvegarder ces informations dans la base de données si nécessaire
    return fileInfo;
  }

  static async deleteFile(filename) {
    try {
      const filePath = path.join(__dirname, '../uploads', filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return false;
    }
  }

  static async getFileStream(filename) {
    const filePath = path.join(__dirname, '../uploads', filename);
    return fs.createReadStream(filePath);
  }

  static async isFileExists(filename) {
    try {
      const filePath = path.join(__dirname, '../uploads', filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static getPublicUrl(filename) {
    // Retourne l'URL publique du fichier
    return `/uploads/${filename}`;
  }
}

module.exports = {
  upload,
  FileService
};
