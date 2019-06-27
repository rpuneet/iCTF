// Imports
const mongoose = require("mongoose");

// Initialise Schema
const Schema = mongoose.Schema;

// Define Team Schema
const TeamSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  lastSubmitted: {
    type: Date,
    default: Date.now
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Team = mongoose.model("teams", TeamSchema);
