const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const formatAdminResponse = (admin) => ({
    id: admin._id,
    email: admin.email,
    nom: admin.nom,
    prenom: admin.prenom,
    role: admin.role,
    status: admin.status,
    permissions: admin.permissions,
    lastLogin: admin.lastLogin
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentative de connexion pour:', email);

        // Vérifier si l'admin existe
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('Admin non trouvé:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            console.log('Mot de passe incorrect pour:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { 
                id: admin._id,
                role: admin.role,
                status: admin.status
            },
            process.env.JWT_SECRET || 'ovpr_secret_key_2024',
            { expiresIn: '24h' }
        );

        // Mettre à jour la dernière connexion
        admin.lastLogin = new Date();
        await admin.save();

        console.log('Connexion réussie pour:', email);

        // Renvoyer le token et les informations de l'admin
        res.json({
            token,
            user: formatAdminResponse(admin)
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
};

exports.verify = async (req, res) => {
    try {
        // req.user est déjà défini par le middleware verifyToken
        const admin = await Admin.findById(req.user.id);
        
        if (!admin) {
            return res.status(404).json({ message: 'Administrateur non trouvé' });
        }

        // Renvoyer la même structure que login
        res.json({
            token: req.token, // Le token original du middleware
            user: formatAdminResponse(admin)
        });

    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la vérification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
