import mongoose from 'mongoose';

const requiredStringValidator = [
  (value) => {
    console.log(value)
    let testValue = value.toString().trim();

    return testValue.length > 0;
  },
  'Please enter a value for {PATH}'
];

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: requiredStringValidator
  },
  createdOn: {
    type: Date,
    required: true,
    validate: requiredStringValidator,
    default: Date.now()
  }
});

export default mongoose.model('Trip', tripSchema);
