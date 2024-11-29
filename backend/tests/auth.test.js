const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

// Test des routes publiques
async function testPublicRoutes() {
    try {
        // Test de l'inscription
        console.log('🔷 Test inscription...');
        const registerResponse = await axios.post(`${API_URL}/users/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'password123',
            phone: '0123456789'
        });
        console.log('✅ Inscription réussie');

        // Test de la connexion
        console.log('🔷 Test connexion...');
        const loginResponse = await axios.post(`${API_URL}/users/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        authToken = loginResponse.data.token;
        console.log('✅ Connexion réussie, token JWT reçu');

        // Test liste des annonces (public)
        console.log('🔷 Test liste des annonces...');
        await axios.get(`${API_URL}/annonces`);
        console.log('✅ Liste des annonces accessible');

    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

// Test des routes protégées
async function testProtectedRoutes() {
    try {
        // Configuration du header avec le token JWT
        const config = {
            headers: { Authorization: `Bearer ${authToken}` }
        };

        // Test profil utilisateur (protégé)
        console.log('🔷 Test accès profil (protégé)...');
        await axios.get(`${API_URL}/users/profile`, config);
        console.log('✅ Profil accessible avec JWT');

        // Test création d'annonce (protégé)
        console.log('🔷 Test création annonce (protégé)...');
        await axios.post(`${API_URL}/annonces`, {
            title: 'Test Annonce',
            description: 'Description test',
            price: 100000,
            location: 'Paris',
            category: 'Appartement'
        }, config);
        console.log('✅ Création d\'annonce réussie avec JWT');

    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

// Exécution des tests
console.log('🚀 Démarrage des tests d\'authentification...\n');
testPublicRoutes().then(() => {
    console.log('\n🔐 Test des routes protégées...\n');
    testProtectedRoutes();
});
