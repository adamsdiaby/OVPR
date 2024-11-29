const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

router.post('/login', async (req, res) => {
    try {
        console.log('Tentative de connexion avec:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email et mot de passe requis',
                received: { email: !!email, password: !!password }
            });
        }

        // Vérifier si l'admin existe
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('Admin non trouvé:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            console.log('Mot de passe incorrect pour:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Mettre à jour la dernière connexion
        admin.lastLogin = new Date();
        await admin.save();

        // Générer le token JWT
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'ovpr_secret_key_2024',
            { expiresIn: '24h' }
        );

        console.log('Connexion réussie pour:', email);

        res.json({
            token,
            user: {
                id: admin._id,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la connexion',
            error: error.message 
        });
    }
});

module.exports = router;
