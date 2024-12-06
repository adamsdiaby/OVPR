const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['utilisateur', 'moderateur', 'admin', 'super_admin'],
        default: 'utilisateur',
        required: true
    },
    status: {
        type: String,
        enum: ['actif', 'inactif', 'suspendu', 'en_attente'],
        default: 'en_attente'
    },
    phoneNumber: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    // Champs pour la suspension
    suspensionDate: {
        type: Date
    },
    suspensionReason: {
        type: String
    },
    suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Champs pour la réactivation
    reactivationDate: {
        type: Date
    },
    reactivationNote: {
        type: String
    },
    reactivatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Champs pour la réinitialisation du mot de passe
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Champs pour la vérification
    verificationToken: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    // Historique des modifications
    modificationHistory: [{
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        modifiedAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Méthode pour ajouter une entrée à l'historique des modifications
userSchema.methods.addToModificationHistory = function(field, oldValue, newValue, modifiedBy, reason) {
    this.modificationHistory.push({
        field,
        oldValue,
        newValue,
        modifiedBy,
        reason,
        modifiedAt: new Date()
    });
};

// Méthode pour vérifier si l'utilisateur est actif
userSchema.methods.isActive = function() {
    return this.status === 'actif';
};

// Méthode pour vérifier si l'utilisateur est suspendu
userSchema.methods.isSuspended = function() {
    return this.status === 'suspendu';
};

// Vérifier si le modèle existe déjà
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
