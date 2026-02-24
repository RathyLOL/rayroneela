const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image: { type: String, required: true } // base64
});

module.exports = mongoose.model('Signature', signatureSchema);