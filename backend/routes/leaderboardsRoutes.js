// /routes/leaderboardsRoutes.js

const express = require('express')
const { getTopPlayersByRegion } = require('../services/leaderboardsService')

const router = express.Router()

/**
 * GET /api/leaderboards/:region
 * Fetch the top N players for the given region (default N = 50)
 */
router.get('/:region', async (req, res, next) => {
  try {
    // Disable cache: force fresh response every time.
    res.set("Cache-Control", "no-store");
    res.removeHeader("ETag");
    const { region } = req.params;
    const limit = Number(req.query.limit) || 1;
    const players = await getTopPlayersByRegion(region, limit);
    res.json(players); // send the mapped array directly
  } catch (err) {
    next(err);
  }
})

module.exports = router
