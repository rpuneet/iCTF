const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateLoginInput = data => {
    let errors = {}

    data.handle = isEmpty(data.handle) ? '' : data.handle;
    data.password = isEmpty(data.password) ? '' : data.password;


    if(Validator.isEmpty(data.handle)) {
        errors.handle = 'Handle field is required';
    }

    if(Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}

module.exports = validateLoginInput;
