const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateHintInput = data => {
    let errors = {}

    data.text = isEmpty(data.text) ? '' : data.text;
    data.value = isEmpty(data.value) ? '' : data.value;

    if(Validator.isEmpty(data.text)) {
        errors.text = 'Text field is required';
    }

    if(!Validator.isNumeric(data.value)) {
        errors.value = 'Value must be a number'
    }

    if(Validator.isEmpty(data.value)) {
        errors.value = 'Value field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}

module.exports = validateHintInput;
