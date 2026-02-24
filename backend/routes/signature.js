const express = require('express');
const Signature = require('../models/Signature');
const User = require('../models/User');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { image } = req.body;
  await new Signature({ userId: req.userId, image }).save();

  // Verifica se os dois já assinaram (simples: conta signatures)
  const count = await Signature.countDocuments();
  if (count >= 2) {
    await User.updateMany({}, { signed: true });
  }
  res.json({ mensagem: 'Assinatura salva' });
});

module.exports = router;