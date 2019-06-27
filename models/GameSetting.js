// Imports
const mongoose = require("mongoose");

// Initialise Schema
const Schema = mongoose.Schema;

// Define Notification Schema
const GameSettingSchema = new Schema({
  organisation: {
    type: String,
    default: "Inertia"
  },
  event: {
    type: String,
    default: "Capture The Flag"
  },
  startTime: {
    type: Date,
    default: Date.now()
  },
  endTime: {
    type: Date,
    default: new Date(2 * Date.now())
  }
});

module.exports = GameSetting = mongoose.model(
  "game-settings",
  GameSettingSchema
);
