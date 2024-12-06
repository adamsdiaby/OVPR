require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définition du schéma Admin
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin', 'moderateur'], default: 'admin' },
    status: { type: String, enum: ['actif', 'inactif', 'en_attente'], default: 'actif' },
    matricule: { type: String, required: true },
    unite: { type: String, required: true },
    lastLogin: { type: Date },
    permissions: {
        annonces: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: true },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            validate: { type: Boolean, default: false }
        },
        signalements: {
            read: { type: Boolean, default: true },
            process: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        statistiques: {
            read: { type: Boolean, default: true },
            export: { type: Boolean, default: false }
        },
        admins: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: true },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        }
    }
});

// Méthode pour comparer les mots de passe
adminSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Création du modèle Admin
const Admin = mongoose.model('Admin', adminSchema);

async function initializeDatabase() {
    try {
        console.log('URI MongoDB:', process.env.MONGODB_URI);
        console.log('Tentative de connexion à MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB avec succès');

        // Création des collections
        const collections = ['admins', 'annonces', 'signalements', 'notifications', 'chatrooms'];
        for (const collectionName of collections) {
            if (!(await mongoose.connection.db.listCollections({ name: collectionName }).hasNext())) {
                await mongoose.connection.db.createCollection(collectionName);
                console.log(`Collection '${collectionName}' créée avec succès`);
            } else {
                console.log(`Collection '${collectionName}' existe déjà`);
            }
        }

        // Vérifier si l'admin par défaut existe déjà
        const existingAdmin = await Admin.findOne({ email: 'admin@ovpr.fr' });
        if (existingAdmin) {
            console.log('L\'administrateur par défaut existe déjà');
            return;
        }

        // Créer l'admin par défaut
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        const defaultAdmin = new Admin({
            email: 'admin@ovpr.fr',
            password: hashedPassword,
            nom: 'Admin',
            prenom: 'OVPR',
            role: 'super_admin',
            status: 'actif',
            matricule: 'ADMIN001',
            unite: 'Administration',
            permissions: {
                annonces: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    validate: true
                },
                signalements: {
                    read: true,
                    process: true,
                    delete: true
                },
                statistiques: {
                    read: true,
                    export: true
                },
                admins: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true
                }
            }
        });

        await defaultAdmin.save();
        console.log('Administrateur par défaut créé avec succès');
        console.log('Email: admin@ovpr.fr');
        console.log('Mot de passe: Admin@123');

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnecté de MongoDB');
        process.exit(0);
    }
}

initializeDatabase();
