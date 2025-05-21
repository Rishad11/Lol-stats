const express = require("express")
const router = express.Router()
const axios = require("axios")
const cache = require("../utils/cache")

// Environment variables
const RIOT_API_KEY = process.env.RIOT_API_KEY

// Base URLs for different Riot API endpoints
const regionToHost = {
  na: "na1.api.riotgames.com",
  euw: "euw1.api.riotgames.com",
  eune: "eun1.api.riotgames.com",
  kr: "kr.api.riotgames.com",
  jp: "jp1.api.riotgames.com",
}

// Get challenger leaderboard
router.get("/:region", async (req, res) => {
  try {
    const { region } = req.params

    // Check if region is valid
    if (!regionToHost[region]) {
      return res.status(400).json({ error: "Invalid region" })
    }

    // Check cache first
    const cacheKey = `leaderboard:${region}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Fetch challenger league
    const challengerResponse = await axios.get(
      `https://${regionToHost[region]}/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } },
    )

    // Fetch grandmaster league
    const grandmasterResponse = await axios.get(
      `https://${regionToHost[region]}/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } },
    )

    // Combine and sort entries
    const challengerEntries = challengerResponse.data.entries.map((entry) => ({
      ...entry,
      tier: "CHALLENGER",
    }))

    const grandmasterEntries = grandmasterResponse.data.entries.map((entry) => ({
      ...entry,
      tier: "GRANDMASTER",
    }))

    const combinedEntries = [...challengerEntries, ...grandmasterEntries]

    // Sort by LP
    combinedEntries.sort((a, b) => b.leaguePoints - a.leaguePoints)

    // Add rank
    const rankedEntries = combinedEntries.map((entry, index) => ({
      id: entry.summonerId,
      rank: index + 1,
      name: entry.summonerName,
      tier: entry.tier,
      leaguePoints: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
    }))

    // Cache the result for 1 hour (3600 seconds)
    cache.set(cacheKey, rankedEntries, 3600)

    res.json(rankedEntries)
  } catch (error) {
    console.error("Error fetching leaderboards:", error.response?.data || error.message)
    res.status(500).json({ error: "Failed to fetch leaderboards" })
  }
})

module.exports = router
// Compare this snippet from backend/routes/leaderboardsRoutes.js: