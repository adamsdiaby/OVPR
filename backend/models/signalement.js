const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema({
    annonceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Annonce',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Signalement', signalementSchema);
