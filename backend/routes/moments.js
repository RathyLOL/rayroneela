const express = require('express');
const multer = require('multer');
const path = require('path');
const Moment = require('../models/Moment');
const { authMiddleware } = require('./auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const router = express.Router();

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  const { type, content } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : content;

  await new Moment({ type, content: filePath }).save();
  res.json({ mensagem: 'Momento adicionado' });
});

router.get('/', authMiddleware, async (req, res) => {
  const moments = await Moment.find().sort({ date: -1 });
  res.json(moments);
});

module.exports = router;