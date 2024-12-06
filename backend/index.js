const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');
const annonceRoutes = require('./routes/annonceRoutes');
const signalementRoutes = require('./routes/signalementRoutes');
const notificationsRoutes = require('./routes/notifications');
const statisticsRoutes = require('./routes/statisticsRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoomsRoutes = require('./routes/chatRooms');
const lawEnforcementRoutes = require('./routes/lawEnforcement');

dotenv.config();
const app = express();

// Configuration CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    if (req.method !== 'OPTIONS') {
        console.log('Body:', req.body);
    }
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/annonces', annonceRoutes);
app.use('/signalements', signalementRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/users', userRoutes);
app.use('/chat', chatRoomsRoutes);
app.use('/law-enforcement', lawEnforcementRoutes);

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Connexion MongoDB et démarrage du serveur
console.log('Tentative de connexion à MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Afficher les routes disponibles
        console.log('\nRoutes disponibles :');
        app._router.stack.forEach((middleware) => {
            if (middleware.route) {
                console.log(`${middleware.route.path} [${Object.keys(middleware.route.methods).join(', ')}]`);
            } else if (middleware.name === 'router') {
                console.log(`\nRouter ${middleware.regexp}:`);
                middleware.handle.stack.forEach((handler) => {
                    if (handler.route) {
                        console.log(`${handler.route.path} [${Object.keys(handler.route.methods).join(', ')}]`);
                    }
                });
            }
        });

        // Démarrer le serveur
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('\nCORS configuration:', corsOptions);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
