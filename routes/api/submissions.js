// Imports
const express = require("express");
const router = require("express").Router();
const passport = require("passport");
const Validator = require("validator");

// Import Validators
const isEmpty = require("../../validation/is-empty");

// Import DB Models
const Submission = require("../../models/Submission");
const Challenge = require("../../models/Challenge");

/* @route GET /api/submissions/test
 ** @desc  Test route
 ** @access Public
 */
router.get("/test", (req, res) => res.json({ message: "Submissions works" }));

/* @route GET /api/submissions/all
 ** @desc  Get all submissions
 ** @access admin
 */
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    // Only admin can access this API
    if (req.user.handle.localeCompare("admin")) {
      errors.auth = "You are not authorized to access this API";
      return res.status(401).json(errors);
    }

    Submission.find()
      .populate("team", ["name", "handle"])
      .populate("challenge", ["name", "value", "category"])
      .sort({ date: -1 })
      .then(submissions => {
        if (submissions.length === 0) {
          errors.nosubmissions = "No Submissions";
          return res.status(404).json(errors);
        }
        res.json(submissions);
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route GET /api/submissions/
 ** @desc  Get your submissions
 ** @access Private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Submission.find({ team: req.user.id })
      .populate("team", ["name", "handle"])
      .populate("challenge", ["name", "value", "category"])
      .sort({ date: -1 })
      .then(submissions => {
        if (submissions.length === 0) {
          errors.nosubmissions = "No Submissions";
          return res.status(404).json(errors);
        }
        res.json(submissions);
      })
      .catch(err => res.status(404).json(err));
  }
);

/* @route POST /api/submissions/submit/:challenge_id
 ** @desc  Make submission
 ** @access Private
 */
router.post(
  "/submit/:challenge_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    const flag = isEmpty(req.body.flag) ? "" : req.body.flag;
    if (Validator.isEmpty(flag)) {
      errors.flag = "Flag field is required";
      return res.status(400).json(errors);
    }
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
          errors.flag = "Contest is not running";
          return res.status(404).json(errors);
        }

        Team.findById(req.user.id)
          .then(curteam => {
            if (!curteam) {
              errors.noteam = "Team not found";
              return res.status(404).json(errors);
            }
            Challenge.findById(req.params.challenge_id)
              .then(challenge => {
                if (!challenge) {
                  errors.nochallenge = "Challenge not found";
                  return res.status(404).json(errors);
                }
                const correctFlag = isEmpty(challenge.flag)
                  ? ""
                  : challenge.flag;

                if (Validator.isEmpty(correctFlag)) {
                  errors.flag = "Flag not found for this challenge";
                  return res.status(404).json(errors);
                }

                let verdict = "Correct";

                if (!Validator.equals(flag, correctFlag)) {
                  verdict = "Wrong";
                }

                const newSubmission = new Submission({
                  team: req.user.id,
                  challenge: challenge._id,
                  flag: flag,
                  verdict: verdict
                });

                if (
                  challenge.solvedBy.filter(
                    id => id.toString() === req.user.id.toString()
                  ).length > 0
                ) {
                  errors.flag = "You have captured this flag";
                  return res.status(400).json(errors);
                }

                if (Validator.equals(verdict, "Correct")) {
                  challenge.solvedBy.push(req.user.id);
                  challenge
                    .save()
                    .then(challenge => {
                      curteam.score += parseFloat(challenge.value);
                      curteam.lastSubmitted = Date.now();
                      curteam
                        .save()
                        .then(curteam => {
                          newSubmission
                            .save()
                            .then(submission => res.json(submission))
                            .catch(err => res.status(404).json(err));
                        })
                        .catch(err => res.status(404).json(err));
                    })
                    .catch(err => res.status(404).json(err));
                } else {
                  newSubmission
                    .save()
                    .then(submission => res.json(submission))
                    .catch(err => res.status(404).json(err));
                }
              })
              .catch(err => res.status(404).json(err));
          })
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);
module.exports = router;
