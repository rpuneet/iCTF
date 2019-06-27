const Validator = require("validator");
const isEmpty = require("./is-empty");

const validateGameSettingsInput = data => {
  let errors = {};

  data.event = isEmpty(data.event) ? "" : data.event;

  data.startTime = isEmpty(data.startTime) ? "" : data.startTime;
  data.endTime = isEmpty(data.endTime) ? "" : data.endTime;
  const currentTime = new Date(Date.now());

  if (Validator.isEmpty(data.startTime)) {
    errors.startTime = "Start Time is required";
  }
  if (Validator.isEmpty(data.endTime)) {
    errors.endTime = "End Time is required";
  }
  if (Validator.isEmpty(data.event)) {
    errors.event = "Event field is required";
  }

  data.startTime = isEmpty(data.startTime) ? "" : new Date(data.startTime);
  data.endTime = isEmpty(data.endTime) ? "" : new Date(data.endTime);

  if (data.startTime <= currentTime) {
    errors.startTime = "Start Time cannot be before current time";
  }

  if (data.endTime <= data.startTime) {
    errors.endTime = "End Time cannot be before start time";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validateGameSettingsInput;
