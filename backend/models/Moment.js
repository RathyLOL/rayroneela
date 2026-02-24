const mongoose = require('mongoose');

const momentSchema = new mongoose.Schema({
  type: { type: String, enum: ['foto', 'momento', 'comida'], required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Moment', momentSchema);