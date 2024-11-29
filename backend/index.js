const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const signalementRoutes = require('./routes/signalementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statistiquesRoutes = require('./routes/statistiquesRoutes');

dotenv.config();
const app = express();

// Logger middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log('Headers:', req.headers); // Ajout des logs pour les headers
    next();
});

// Configuration CORS détaillée
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Middleware pour gérer les en-têtes CORS manuellement si nécessaire
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.use(bodyParser.json());

// Connection à MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connecté à MongoDB Atlas avec succès!'))
.catch(err => console.error('❌ Erreur de connexion MongoDB:', err));

// Routes API publiques
app.use('/api/users', userRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/signalements', signalementRoutes);
app.use('/api/statistiques', statistiquesRoutes);

// Routes Admin
app.use('/admin/auth', adminRoutes);
app.use('/admin/annonces', annonceRoutes);
app.use('/admin/signalements', signalementRoutes);
app.use('/admin/statistiques', statistiquesRoutes);

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'API fonctionne correctement' });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    console.log(`❌ Route non trouvée: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route non trouvée: ${req.method} ${req.url}` });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.stack);
    res.status(500).json({ message: 'Une erreur est survenue!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
