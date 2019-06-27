// Imports
const mongoose = require('mongoose');

// Initialise Schema
const Schema = mongoose.Schema

// Define Notification Schema
const NotificationSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Notification = mongoose.model('notifications' , NotificationSchema);