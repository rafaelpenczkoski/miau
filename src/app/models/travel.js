const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const TravelSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    destination: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Travel = mongoose.model('Travel', TravelSchema);

module.exports = Travel;