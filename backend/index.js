const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// Services
const notificationService = require('./services/notificationService');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const signalementRoutes = require('./routes/signalementRoutes');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');
const chatRoomsRoutes = require('./routes/chatRooms');
const lawEnforcementRoutes = require('./routes/lawEnforcement');
const statisticsRoutes = require('./routes/statisticsRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Logger middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
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

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connection à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ovpr', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB Atlas avec succès!'))
.catch(err => console.error('❌ Erreur de connexion MongoDB:', err));

// Routes API publiques
app.use('/api/users', userRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/signalements', signalementRoutes);

// Routes Admin
app.use('/admin', adminRoutes);
app.use('/admin/annonces', annonceRoutes);
app.use('/admin/signalements', signalementRoutes);
app.use('/admin/statistiques', statisticsRoutes);
app.use('/admin/notifications', notificationsRoutes);
app.use('/admin/chat', chatRoomsRoutes);
app.use('/law-enforcement', lawEnforcementRoutes);

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Une erreur est survenue!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

module.exports = { app, server };
