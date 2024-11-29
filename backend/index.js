const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/authRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const signalementRoutes = require('./routes/signalementRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));
app.use(bodyParser.json());

// Connection à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion MongoDB:', err));

// Routes
app.use('/admin/auth', authRoutes);
app.use('/admin/annonces', annonceRoutes);
app.use('/admin/signalements', signalementRoutes);
app.use('/admin/statistiques', statisticsRoutes);

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'API fonctionne correctement' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
