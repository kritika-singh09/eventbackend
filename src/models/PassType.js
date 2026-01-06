const mongoose = require('mongoose');

const passHolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String
  }
});

const passTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Teens', 'Couple', 'Family']
  },
  price: {
    type: Number
  },
  max_people: {
    type: Number
  },
  pass_holders: [passHolderSchema],
  no_of_people: {
    type: Number,
    default: 0
  },
  no_of_passes: {
    type: Number,
    default: 0
  },
  valid_for_event: {
    type: String,
    default: 'New Year 2025'
  },
  description: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Remove all validations
passTypeSchema.pre('validate', function(next) {
  next();
});

module.exports = mongoose.model('PassType', passTypeSchema);