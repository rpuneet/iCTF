// Imports
const mongoose = require("mongoose");

// Initialise Schema
const Schema = mongoose.Schema;

// Define Notification Schema
const ChallengeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  flag: {
    type: String
  },
  value: {
    type: String,
    required: true
  },
  maxAttempts: {
    type: String,
    default: "0"
  },
  requirements: {
    type: [Schema.Types.ObjectId],
    ref: "challenges"
  },
  solvedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "teams"
    }
  ],
  hints: [
    {
      text: {
        type: String,
        required: true
      },
      value: {
        type: String,
        default: 0
      }
    }
  ]
});

module.exports = Challenge = mongoose.model("challenges", ChallengeSchema);
