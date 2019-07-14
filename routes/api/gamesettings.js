// Imports
const express = require("express");
const router = require("express").Router();
const passport = require("passport");

// Import DB Models
const GameSetting = require("../../models/GameSetting");

// Import Validators
const validateGameSettings = require("../../validation/gameSettings");
/* @route GET /api/gamesettings/test
 ** @desc  Test route
 ** @access Public
 */
router.get("/test", (req, res) => res.json({ message: "Game Settings works" }));

/* @route GET /api/gamesettings/
 ** @desc  Get Game Settings
 ** @access Public
 */
router.get("/", (req, res) => {
  const errors = {};
  GameSetting.findOne()
    .then(gameSetting => {
      if (!gameSetting) {
        errors.game = "No settings present";
        return res.status(404).json(errors);
      }
      res.json(gameSetting);
    })
    .catch(err => res.status(404).json(err));
});

/* @route PUT /api/gamesettings/update
 ** @desc  Update Game Settings
 ** @access admin
 */
router.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateGameSettings(req.body);

    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    // Validation Check
    if (!isValid) {
      return res.status(400).json(errors);
    }

    GameSetting.findOne().then(gameSetting => {
      gameSetting.organisation = req.body.organisation;
      gameSetting.event = req.body.event;
      gameSetting.startTime = req.body.startTime;
      gameSetting.endTime = req.body.endTime;

      gameSetting
        .save()
        .then(gameSetting => res.json(gameSetting))
        .catch(err => res.status(404).json({ err }));
    });
  }
);

module.exports = router;
