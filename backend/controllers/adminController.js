const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('👉 Tentative de connexion admin:', email);

        // Trouver l'admin
        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            console.log('❌ Admin non trouvé:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            console.log('❌ Mot de passe invalide pour:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token
        const token = jwt.sign(
            { 
                id: admin._id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Mettre à jour la dernière connexion
        admin.lastLogin = new Date();
        await admin.save();

        console.log('✅ Connexion admin réussie:', email);

        // Retourner le token et les infos de l'admin
        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                nom: admin.nom,
                prenom: admin.prenom,
                role: admin.role,
                permissions: admin.permissions,
                lastLogin: admin.lastLogin
            }
        });

    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
};
