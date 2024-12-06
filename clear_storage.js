const fs = require('fs');
const path = require('path');

// Chemin vers le localStorage (peut varier selon le navigateur)
const localStoragePath = path.join(
    process.env.APPDATA,
    '..', 'Local',
    'Google',
    'Chrome',
    'User Data',
    'Default',
    'Local Storage'
);

console.log('Nettoyage du localStorage...');

try {
    // Supprime tous les fichiers de localStorage pour le domaine localhost
    const files = fs.readdirSync(localStoragePath);
    files.forEach(file => {
        if (file.includes('localhost')) {
            const filePath = path.join(localStoragePath, file);
            fs.unlinkSync(filePath);
            console.log(`Fichier supprimé : ${file}`);
        }
    });
    
    console.log('localStorage nettoyé avec succès!');
} catch (error) {
    console.error('Erreur lors du nettoyage:', error);
}
