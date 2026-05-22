const mongoose = require('mongoose');

function isValidObjectId(value) {
  return (
    typeof value === 'string' &&
    mongoose.Types.ObjectId.isValid(value) &&
    new mongoose.Types.ObjectId(value).toString() === value
  );
}

module.exports = { isValidObjectId };
