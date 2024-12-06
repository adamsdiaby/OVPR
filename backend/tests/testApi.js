const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
let token = '';

async function testAPI() {
    try {
        // 1. Créer un compte
        console.log('1. Création du compte...');
        const registerResponse = await axios.post(`${API_URL}/auth/register`, {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'Test123!',
            phone: '+225 0123456789'
        });
        console.log('Compte créé:', registerResponse.data);

        // 2. Se connecter
        console.log('\n2. Connexion...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'john.doe@example.com',
            password: 'Test123!'
        });
        token = loginResponse.data.token;
        console.log('Connecté avec succès, token reçu');

        // 3. Créer une annonce
        console.log('\n3. Création d\'une annonce...');
        const formData = new FormData();
        formData.append('title', 'iPhone 13 Pro perdu à Cocody');
        formData.append('description', 'iPhone 13 Pro Max couleur graphite perdu dans le quartier de Cocody');
        formData.append('status', 'lost');
        formData.append('location', 'Cocody, Abidjan');
        formData.append('category', 'telephone');
        formData.append('contact', '+225 0123456789');
        formData.append('price', '500000');
        formData.append('currency', 'XOF');
        formData.append('specificFields', JSON.stringify({
            imei: '123456789012345',
            marque: 'Apple',
            modele: 'iPhone 13 Pro Max'
        }));

        const createResponse = await axios.post(`${API_URL}/annonces`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        const annonceId = createResponse.data.annonce._id;
        console.log('Annonce créée:', createResponse.data);

        // 4. Récupérer toutes les annonces
        console.log('\n4. Récupération des annonces...');
        const annoncesResponse = await axios.get(`${API_URL}/annonces`);
        console.log('Annonces récupérées:', annoncesResponse.data.length, 'annonces trouvées');

        // 5. Rechercher des annonces
        console.log('\n5. Recherche d\'annonces...');
        const searchResponse = await axios.get(`${API_URL}/annonces?category=telephone&status=lost&search=iphone`);
        console.log('Résultats de recherche:', searchResponse.data.length, 'annonces trouvées');

        // 6. Obtenir les statistiques
        console.log('\n6. Récupération des statistiques...');
        const statsResponse = await axios.get(`${API_URL}/annonces/stats`);
        console.log('Statistiques:', statsResponse.data);

        // 7. Mettre à jour l'annonce
        console.log('\n7. Mise à jour de l\'annonce...');
        const updateFormData = new FormData();
        updateFormData.append('status', 'found');
        updateFormData.append('title', 'iPhone 13 Pro RETROUVÉ à Cocody');

        const updateResponse = await axios.put(`${API_URL}/annonces/${annonceId}`, updateFormData, {
            headers: {
                ...updateFormData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Annonce mise à jour:', updateResponse.data);

        // 8. Supprimer l'annonce
        console.log('\n8. Suppression de l\'annonce...');
        const deleteResponse = await axios.delete(`${API_URL}/annonces/${annonceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Annonce supprimée:', deleteResponse.data);

        console.log('\nTests terminés avec succès!');
    } catch (error) {
        console.error('Erreur lors des tests:', error.response?.data || error.message);
    }
}

testAPI();
