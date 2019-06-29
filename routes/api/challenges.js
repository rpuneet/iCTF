// Imports
const express = require("express");
const router = require("express").Router();
const passport = require("passport");

// Import Validators
const validateChallengeInput = require("../../validation/challenge");
const validateHintInput = require("../../validation/hint");
const Validator = require("validator");

// Import DB Models
const Challenge = require("../../models/Challenge");
const GameSetting = require("../../models/GameSetting");

// Routes

/* @route GET /api/challenges/test
 ** @desc  Test route
 ** @access Public
 */
router.get("/test", (req, res) => res.json({ message: "Challenges works" }));

/* @route GET /api/challenges/
 ** @desc  Get all challenges
 ** @access Private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    GameSetting.findOne()
      .then(settings => {
        if (!settings) {
          errors.nosettings = "No game settings found";
          return res.status(404).json(errors);
        }
        const start = new Date(settings.startTime);
        const end = new Date(settings.endTime);
        const current = new Date(Date.now());

        if (start > current || end < current) {
          errors.challenge = "Contest is not running";
          return res.status(400).json(errors);
        }
        Challenge.find({}, { flag: 0 })
          .populate("requirements", ["name"])
          .populate("solvedBy", ["handle", "name"])
          .then(challenges => {
            if (challenges.length === 0) {
              errors.nochallenge = "No challenges found";
              return res.status(404).json(errors);
            }
            res.json(challenges);
          })
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route POST /api/challenges/add
 ** @desc  Add new challenges
 ** @access admin
 */
router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateChallengeInput(req.body);

    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    // Validation check
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Challenge.findOne({ name: req.body.name })
      .then(challenge => {
        if (challenge) {
          errors.name = "Challenge Already Exist";
          return res.status(400).json(errors);
        }

        const newChallenge = new Challenge({
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          state: req.body.state,
          value: req.body.value,
          maxAttempts: req.body.maxAttempts,
          requirements: req.body.requirements,
          flag: req.body.flag
        });

        newChallenge
          .save()
          .then(challenge => {
            res.json(challenge);
          })
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route PUT /api/challenges/update/:challenge_id
 ** @desc  Update challenge by id
 ** @access admin
 */
router.put(
  "/update/:challenge_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateChallengeInput(req.body);

    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    // Validation check
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Challenge.findById(req.params.challenge_id)
      .then(challenge => {
        if (!challenge) {
          errors.notfound = "Challenge not found";
          return res.status(404).json(errors);
        }
        const oldName = challenge.name;
        const updatedChallenge = {
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          state: req.body.state,
          value: req.body.value,
          maxAttempts: req.body.maxAttempts,
          requirements: req.body.requirements,
          flag: req.body.flag,
          hints: challenge.hints,
          solvedBy: challenge.solvedBy
        };
        Challenge.findOne({ name: updatedChallenge.name })
          .then(challenge => {
            if (
              challenge &&
              !Validator.equals(oldName, updatedChallenge.name)
            ) {
              errors.name = "Challenge Already Exist";
              return res.status(400).json(errors);
            }
            Challenge.findOneAndUpdate(
              {
                _id: req.params.challenge_id
              },
              {
                $set: updatedChallenge
              },
              {
                new: true
              }
            )
              .then(challenge => {
                res.json(challenge);
              })
              .catch(err => res.status(404).json(err));
          })
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route DELETE /api/challenges/delete/:challenge_id
 ** @desc  Delete challenge by id
 ** @access admin
 */
router.delete(
  "/delete/:challenge_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    Challenge.findOneAndRemove({ _id: req.params.challenge_id })
      .then(() => {
        res.json({ success: true });
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route POST /api/challenges/add/hint/:challenge_id
 ** @desc  Add hint to challenge by id
 ** @access admin
 */
router.post(
  "/add/hint/:challenge_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateHintInput(req.body);

    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    // Validation check
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Challenge.findById(req.params.challenge_id)
      .then(challenge => {
        if (!challenge) {
          errors.notfound = "Challenge not found";
          return res.status(404).json(errors);
        }
        const hint = {
          text: req.body.text,
          value: req.body.value
        };
        challenge.hints.unshift(hint);
        challenge
          .save()
          .then(challenge => res.json(challenge))
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route PUT /api/challenges/update/hint/:challenge_id/:hint_id
 ** @desc  Update hint by hint id and challenge id
 ** @access admin
 */
router.put(
  "/update/hint/:challenge_id/:hint_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateHintInput(req.body);

    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    // Validation check
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Challenge.findById(req.params.challenge_id)
      .then(challenge => {
        if (!challenge) {
          errors.notfound = "Challenge not found";
          return res.status(404).json(errors);
        }
        const updateIndex = challenge.hints
          .map(item => item._id.toString())
          .indexOf(req.params.hint_id);

        if (updateIndex === -1) {
          errors.hint = "Hint not found";
          return res.status(404).json(errors);
        }

        challenge.hints[updateIndex].text = req.body.text;
        challenge.hints[updateIndex].value = req.body.value;

        challenge
          .save()
          .then(challenge => res.json(challenge))
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route DELETE /api/challenges/delete/hint/:challenge_id/:hint_id
 ** @desc  Delete hint by hint id and challenge id
 ** @access admin
 */
router.delete(
  "/delete/hint/:challenge_id/:hint_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    Challenge.findById(req.params.challenge_id)
      .then(challenge => {
        if (!challenge) {
          errors.notfound = "Challenge not found";
          return res.status(404).json(errors);
        }
        const removedIndex = challenge.hints
          .map(item => item._id.toString())
          .indexOf(req.params.hint_id);

        if (removedIndex === -1) {
          errors.hint = "Hint not found";
          return res.status(404).json(errors);
        }
        challenge.hints.splice(removedIndex, 1);

        challenge
          .save()
          .then(challenge => res.json(challenge))
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;
