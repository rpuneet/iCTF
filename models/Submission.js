// Imports
const mongoose = require('mongoose');

// Initialise Schema
const Schema = mongoose.Schema

// Define Notification Schema
const SubmissionSchema = new Schema({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'teams'        
    },
    challenge: {
        type: Schema.Types.ObjectId,
        ref: 'challenges'        
    },
    flag: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    verdict: {
        type: String,
        required: true
    }
});

module.exports = Submission = mongoose.model('submissions' , SubmissionSchema);