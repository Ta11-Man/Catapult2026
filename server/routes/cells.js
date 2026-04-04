const express = require('express');
const Cell = require('../models/Cell');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const cells = await Cell.find({}, { _id: 0, gridIndex: 1, imageData: 1, createdAt: 1 })
      .sort({ gridIndex: 1 })
      .lean();

    res.json(cells);
  } catch (error) {
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nullifierHash, imageData } = req.body;

    if (!nullifierHash || !imageData) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const existing = await Cell.findOne({ nullifierHash }).lean();
    if (existing) {
      return res.status(409).json({ error: 'already_submitted' });
    }

    const count = await Cell.countDocuments();
    const created = await Cell.create({
      nullifierHash,
      imageData,
      gridIndex: count
    });

    return res.status(201).json({
      gridIndex: created.gridIndex,
      imageData: created.imageData
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'already_submitted' });
    }
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;

