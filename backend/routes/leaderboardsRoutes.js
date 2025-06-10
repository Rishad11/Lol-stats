const express = require('express');
const { getTopPlayersByRegion } = require('../services/leaderboardsService');

const router = express.Router();

router.get('/:region', async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.removeHeader("ETag");
    const { region } = req.params;
    const limit = Number(req.query.limit) || 10;
    const players = await getTopPlayersByRegion(region, limit);
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch leaderboard" });
  }
});

module.exports = router;
