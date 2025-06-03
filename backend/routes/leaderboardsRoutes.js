// /routes/leaderboardsRoutes.js

const express = require('express')
const { getTopPlayersByRegion } = require('../services/leaderboardsService')

const router = express.Router()

/**
 * GET /api/leaderboards/:region
 * Fetch the top N players for the given region 
 */
router.get('/:region', async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    res.removeHeader("ETag");
    const { region } = req.params;
    const limit = Number(req.query.limit) || 10;
    const players = await getTopPlayersByRegion(region, limit);
    res.json(players);
  } catch (err) {
    next(err);
  }
})

module.exports = router
