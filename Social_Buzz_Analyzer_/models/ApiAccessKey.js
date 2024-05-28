const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const apiAccessKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apiKey: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4()
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  }
});

// Method to generate a new API key
apiAccessKeySchema.methods.generateNewApiKey = function() {
  this.apiKey = uuidv4();
  console.log(`New API key generated: ${this.apiKey}`);
  return this.apiKey;
};

// Static method to validate an API key
apiAccessKeySchema.statics.validateApiKey = async function(apiKey) {
  try {
    const accessKey = await this.findOne({ apiKey: apiKey, isActive: true });
    console.log(`API key validation result for ${apiKey}: ${!!accessKey}`);
    return !!accessKey;
  } catch (error) {
    console.error(`Error validating API key ${apiKey}:`, error.message, error.stack);
    throw error;
  }
};

// Static methods to activate/deactivate an API key
apiAccessKeySchema.statics.activateApiKey = async function(apiKey) {
  try {
    const updatedKey = await this.findOneAndUpdate({ apiKey: apiKey }, { isActive: true }, { new: true });
    console.log(`API key activated: ${apiKey}`);
    return updatedKey;
  } catch (error) {
    console.error(`Error activating API key ${apiKey}:`, error.message, error.stack);
    throw error;
  }
};

apiAccessKeySchema.statics.deactivateApiKey = async function(apiKey) {
  try {
    const updatedKey = await this.findOneAndUpdate({ apiKey: apiKey }, { isActive: false }, { new: true });
    console.log(`API key deactivated: ${apiKey}`);
    return updatedKey;
  } catch (error) {
    console.error(`Error deactivating API key ${apiKey}:`, error.message, error.stack);
    throw error;
  }
};

const ApiAccessKey = mongoose.model('ApiAccessKey', apiAccessKeySchema);

module.exports = ApiAccessKey;