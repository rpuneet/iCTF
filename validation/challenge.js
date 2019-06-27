const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateChallengeInput = data => {
    let errors = {}

    data.name = isEmpty(data.name) ? '' : data.name;
    data.description = isEmpty(data.description) ? '' : data.description;
    data.category = isEmpty(data.category) ? '' : data.category;
    data.state = isEmpty(data.state) ? '' : data.state;
    data.value = isEmpty(data.value) ? '' : data.value;

    if(!Validator.isNumeric(data.value)) {
        errors.value = 'Value must be a number'
    }

    if(Validator.isEmpty(data.name)) {
        errors.name = 'Name field is required';
    }

    if(Validator.isEmpty(data.description)) {
        errors.description = 'Description field is required';
    }

    if(Validator.isEmpty(data.category)) {
        errors.category = 'Category field is required';
    }

    if(Validator.isEmpty(data.state)) {
        errors.state = 'State field is required';
    }

    if(Validator.isEmpty(data.value)) {
        errors.value = 'Value field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}

module.exports = validateChallengeInput;
