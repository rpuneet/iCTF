// Imports
const express = require('express');
const router = require('express').Router()
const passport = require('passport')

// Import DB Models
const Notification = require('../../models/Notification');

// Import Validators
const validateNotificationInput = require('../../validation/notification');

/* @route GET /api/notifications/test
** @desc  Test route
** @access Public
*/
router.get('/test' , (req , res) => res.json({message: 'Notifications works'}));

/* @route GET /api/notifications/
** @desc  Get all Notifications
** @access Private
*/
router.get('/' , passport.authenticate('jwt' , {session: false}) , (req , res) => {
    const errors = {}
    Notification.find()
        .sort({date: -1})
        .then(notifications => {
            if(notifications.length === 0) {
                errors.nonotifications = 'No notification present'
                return res.status(404).json(errors);
            }
            res.json(notifications);
        })
        .catch(err => res.status(404).json(err));
})


/* @route POST /api/notifications/
** @desc  Add a new notification
** @access admin
*/
router.post('/' , passport.authenticate('jwt' , {session: false}) , (req , res) => {
    const {errors , isValid} = validateNotificationInput(req.body);
    
    // Only admin can access this API
    if(req.user.handle.localeCompare('admin')) {
        errors.auth = 'You are not authorized to access this API';
        return res.status(401).json(errors);
    }
    
    // Validation Check
    if(!isValid){
        return res.status(400).json(errors);
    }

    const newNotification = new Notification({
        text: req.body.text
    });

    newNotification.save()
        .then(notification => res.json(notification))
        .catch(err => res.status(404).json(err));

})


/* @route DELETE /api/notifications/:notification_id
** @desc  Delete a notification by Id
** @access admin
*/
router.delete('/:notification_id' , passport.authenticate('jwt' , {session: false}) , (req , res) => {
    const errors = {}

    // Only admin can access this API
    if(req.user.handle.localeCompare('admin')) {
        errors.auth = 'You are not authorized to access this API';
        return res.status(401).json(errors);
    }

    Notification.findOneAndRemove({_id : req.params.notification_id})
        .then(() => {
            res.json({success: true});
        })
        .catch(err => res.status(404).json({nonotification:'Notification not found'}));
})

/* @route PUT /api/notifications/:notification_id
** @desc  Update a notification by Id
** @access admin
*/
router.put('/:notification_id' , passport.authenticate('jwt' , {session: false}) , (req , res) => {
    const {errors , isValid} = validateNotificationInput(req.body);
    
    // Only admin can access this API
    if(req.user.handle.localeCompare('admin')) {
        errors.auth = 'You are not authorized to access this API';
        return res.status(401).json(errors);
    }

    // Validation Check
    if(!isValid){
        return res.status(400).json(errors);
    }

    Notification.findById(req.params.notification_id)
        .then(notification => {
            if(!notification) {
                errors.nonotification = 'Notification not found';
                return res.status(404).json(errors)
            }
            const updatedNotification = {
                text: req.body.text
            };

            Notification.findOneAndUpdate({
                    _id: req.params.notification_id,
                }, {
                    $set: updatedNotification
                }, {
                    new: true
                })
                .then(notification => res.json(notification))
                .catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json({nonotification:'Notification not found'}));
})


module.exports = router;