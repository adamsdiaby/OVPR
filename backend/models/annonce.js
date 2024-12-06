const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'reported', 'lost', 'found', 'stolen', 'forgotten'],
        default: 'pending',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    moderatedAt: {
        type: Date
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    rejectionReason: {
        type: String
    },
    isSensitive: {
        type: Boolean,
        default: false
    },
    sensitiveReason: {
        type: String
    },
    sensitiveMarkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    notes: [{
        content: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        visibility: {
            type: String,
            enum: ['public', 'admin', 'law_enforcement'],
            default: 'public'
        }
    }]
});

// Middleware pre-save pour mettre à jour updatedAt
annonceSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Vérifier si le modèle existe déjà
module.exports = mongoose.models.Annonce || mongoose.model('Annonce', annonceSchema);
