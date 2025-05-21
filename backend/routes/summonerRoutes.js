const express = require("express")
const router = express.Router()
const axios = require("axios")
const rateLimit = require("express-rate-limit")
const cache = require("../utils/cache")

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: "Too many requests from this IP, please try again after a minute",
})

// Apply rate limiting to all routes
router.use(apiLimiter)

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

const regionToRegion = {
  na: "americas",
  euw: "europe",
  eune: "europe",
  kr: "asia",
  jp: "asia",
}

// Get summoner data by name
router.get("/:region/:summonerName", async (req, res) => {
  try {
    const { region, summonerName } = req.params

    // Check if region is valid
    if (!regionToHost[region]) {
      return res.status(400).json({ error: "Invalid region" })
    }

    // Check cache first
    const cacheKey = `summoner:${region}:${summonerName}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Fetch summoner data
    const summonerResponse = await axios.get(
      `https://${regionToHost[region]}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } },
    )

    const summonerData = summonerResponse.data

    // Fetch rank data
    const rankResponse = await axios.get(
      `https://${regionToHost[region]}/lol/league/v4/entries/by-summoner/${summonerData.id}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } },
    )

    // Find solo queue rank
    const soloQueueRank = rankResponse.data.find((queue) => queue.queueType === "RANKED_SOLO_5x5") || {
      tier: "UNRANKED",
      rank: "",
      leaguePoints: 0,
      wins: 0,
      losses: 0,
    }

    // Combine data
    const result = {
      ...summonerData,
      rank: soloQueueRank,
    }

    // Cache the result for 5 minutes
    cache.set(cacheKey, result, 300)

    res.json(result)
  } catch (error) {
    console.error("Error fetching summoner data:", error.response?.data || error.message)

    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Summoner not found" })
    }

    res.status(500).json({ error: "Failed to fetch summoner data" })
  }
})

// Get match history
router.get("/:region/:puuid/matches", async (req, res) => {
  try {
    const { region, puuid } = req.params
    const count = req.query.count || 10

    // Check if region is valid
    if (!regionToRegion[region]) {
      return res.status(400).json({ error: "Invalid region" })
    }

    // Check cache first
    const cacheKey = `matches:${region}:${puuid}:${count}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Fetch match IDs
    const matchIdsResponse = await axios.get(
      `https://${regionToRegion[region]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      {
        params: { count },
        headers: { "X-Riot-Token": RIOT_API_KEY },
      },
    )

    const matchIds = matchIdsResponse.data

    // Fetch match details
    const matchDetailsPromises = matchIds.map((matchId) =>
      axios.get(`https://${regionToRegion[region]}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY },
      }),
    )

    const matchResponses = await Promise.all(matchDetailsPromises)
    const matches = matchResponses.map((response) => response.data)

    // Process match data to extract relevant information
    const processedMatches = matches.map((match) => {
      const participant = match.info.participants.find((p) => p.puuid === puuid)

      return {
        id: match.metadata.matchId,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration,
        gameMode: match.info.gameMode,
        champion: participant.championName,
        win: participant.win,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        role: participant.teamPosition || participant.role,
        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
        items: [
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
          participant.item6,
        ].filter((item) => item !== 0),
      }
    })

    // Cache the result for 5 minutes
    cache.set(cacheKey, processedMatches, 300)

    res.json(processedMatches)
  } catch (error) {
    console.error("Error fetching match history:", error.response?.data || error.message)
    res.status(500).json({ error: "Failed to fetch match history" })
  }
})

module.exports = router
