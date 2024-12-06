require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('./routes/admin');
const signalementRoutes = require('./routes/signalementRoutes');
const userRoutes = require('./routes/userRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
const { initializeRoles } = require('./models/Role');

const app = express();

// Configuration CORS plus permissive pour le développement
const corsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true
};

// Appliquer CORS à toutes les routes
app.use(cors(corsOptions));

// Support des pré-vérifications OPTIONS
app.options('*', cors(corsOptions));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    next();
});

// Routes
app.use('/api/admin', admin);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/signalements', signalementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Gestion des erreurs CORS
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  } else {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// 404 handler - doit être après toutes les autres routes
app.use((req, res) => {
    console.log('Route non trouvée:', req.method, req.url);
    res.status(404).json({ 
        message: 'Route non trouvée',
        requested: {
            method: req.method,
            url: req.url,
            path: req.path
        }
    });
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connecté à MongoDB');
        
        // Initialiser les rôles par défaut
        await initializeRoles();
        console.log('Rôles initialisés avec succès');
        
        // Afficher toutes les routes disponibles
        console.log('\nRoutes disponibles :');
        const printRoutes = (stack, basePath = '') => {
            stack.forEach(layer => {
                if (layer.route) {
                    const methods = Object.keys(layer.route.methods)
                        .filter(method => layer.route.methods[method])
                        .join(', ');
                    console.log(`${basePath}${layer.route.path} [${methods}]`);
                } else if (layer.name === 'router') {
                    console.log(`\nRouter ${layer.regexp}:`);
                    printRoutes(layer.handle.stack, basePath);
                }
            });
        };
        
        printRoutes(app._router.stack);
        
        // Démarrer le serveur
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
            console.log('\nCORS configuration:', corsOptions);
        });
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });
