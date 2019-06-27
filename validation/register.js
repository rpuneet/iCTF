const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateRegisterInput = data => {
    let errors = {}

    data.name = isEmpty(data.name) ? '' : data.name;
    data.handle = isEmpty(data.handle) ? '' : data.handle;
    data.email = isEmpty(data.email) ? '' : data.email;
    data.password = isEmpty(data.password) ? '' : data.password;
    data.confirmPassword = isEmpty(data.confirmPassword) ? '' : data.confirmPassword;

    if(!Validator.isLength(data.name , {min: 2 , max: 40})) {
        errors.name = 'Name must be between 2 and 40 chars';
    }

    if(!Validator.isLength(data.handle , {min: 2 , max: 20})) {
        errors.handle = 'Handle must be between 2 and 20 chars';
    }

    if(!Validator.isLength(data.password , {min: 2 , max: 50})) {
        errors.password = 'Password must be between 2 and 50 chars';
    }

    if(!Validator.isEmail(data.email)) {
        errors.email = 'Invalid Email'
    }

    if(Validator.isEmpty(data.name)) {
        errors.name = 'Name field is required';
    }

    if(Validator.isEmpty(data.handle)) {
        errors.handle = 'Handle field is required';
    }

    if(Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }

    if(Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    if(!Validator.equals(data.password , data.confirmPassword)) {
        errors.confirmPassword = 'Passwords do not match'
    }

    if(Validator.isEmpty(data.confirmPassword)) {
        errors.confirmPassword = 'Confirm Password field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}

module.exports = validateRegisterInput;
