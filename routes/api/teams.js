// Imports
const express = require("express");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Import Validators
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Import DB models
const Team = require("../../models/Team");
const GameSetting = require("../../models/GameSetting");
// Routes

/* @route GET /api/teams/test
 ** @desc  Test route
 ** @access Public
 */
router.get("/test", (req, res) => res.json({ message: "Teams works" }));

/* @route GET /api/teams/
 ** @desc  Get all team details
 ** @access Public
 */
router.get("/", (req, res) => {
  Team.find()
    .then(teams => res.json(teams))
    .catch(err => res.status(404).json(err));
});

/* @route GET /api/teams/current
 ** @desc  Get current team details
 ** @access Private
 */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      handle: req.user.handle,
      name: req.user.name
    });
  }
);

/* @route GET /api/teams/leaderboard
 ** @desc  Get the leaderboard
 ** @access Private
 */
router.get(
  "/leaderboard",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Team.find({ handle: { $ne: "admin" } }, { name: 1, score: 1, handle: 1 })
      .sort({ score: -1, lastSubmitted: 1 })
      .then(teams => res.json(teams))
      .catch(err => res.status(404).json(err));
  }
);

/* @route POST /api/teams/register
 ** @desc  Register new team
 ** @access Public
 */
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  Team.findOne({ email: req.body.email })
    .then(team => {
      if (team) {
        errors.email = "Email already exists";
        return res.status(400).json(errors);
      }
      Team.findOne({ handle: req.body.handle })
        .then(team => {
          if (team) {
            errors.handle = "Handle already exists";
            return res.status(400).json(errors);
          }

          const newTeam = new Team({
            name: req.body.name,
            handle: req.body.handle,
            email: req.body.email,
            password: req.body.password
          });

          bcrypt.genSalt(12, (err, salt) => {
            if (err) throw err;

            bcrypt.hash(newTeam.password, salt, (err, hash) => {
              if (err) throw err;
              newTeam.password = hash;

              newTeam
                .save()
                .then(team => {
                  if (team.handle === "admin") {
                    const gameSetting = new GameSetting();
                    gameSetting
                      .save()
                      .then(gameSetting => res.json(team))
                      .catch(err => res.status(404).json(err));
                  } else {
                    res.json(team);
                  }
                })
                .catch(err => res.status(404).json(err));
            });
          });
        })
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json(err));
});

/* @route POST /api/teams/login
 ** @desc  Login
 ** @access Public
 */
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const handle = req.body.handle;
  const password = req.body.password;
  // Find team by handle.
  Team.findOne({ handle })
    .then(team => {
      if (!team) {
        errors.handle = "Handle not found";
        return res.status(404).json(errors);
      }

      // Check for password
      bcrypt
        .compare(password, team.password)
        .then(isMatch => {
          if (isMatch) {
            // Payload
            const payload = {
              id: team._id,
              handle: team.handle,
              name: team.name
            };

            // Sign Token
            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 259200 },
              (err, token) => {
                if (err) throw err;

                // Send Token
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              }
            );
          } else {
            errors.password = "Incorrect password";
            res.status(400).json(errors);
          }
        })
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json(err));
});

module.exports = router;
