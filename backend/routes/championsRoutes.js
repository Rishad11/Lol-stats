const express = require("express")
const router = express.Router()
const axios = require("axios")
const cache = require("../utils/cache")

// Environment variables
const RIOT_API_KEY = process.env.RIOT_API_KEY

// Get all champions
router.get("/", async (req, res) => {
  try {
    // Check cache first
    const cacheKey = "champions:all"
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Fetch latest version
    const versionsResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
    const latestVersion = versionsResponse.data[0]

    // Fetch champions data
    const championsResponse = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`,
    )

    const championsData = championsResponse.data.data

    // Process champions data
    const champions = Object.values(championsData).map((champion) => ({
      id: champion.id,
      name: champion.name,
      title: champion.title,
      blurb: champion.blurb,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`,
      tags: champion.tags, // These are the roles (Fighter, Tank, Mage, etc.)
    }))

    // Fetch champion statistics from Riot API
    // For this implementation, we'll use the Data Dragon API for champion data
    // and then fetch champion statistics from a third-party API or calculate them

    // For champion win rates, pick rates, and ban rates, we would typically
    // analyze match data over time. Since this requires a large dataset,
    // we'll use a simplified approach for this implementation.

    // You could integrate with a third-party API that provides these statistics
    // For example: https://developer.riotgames.com/apis#champion-mastery-v4

    // For now, we'll fetch champion mastery data as a proxy for popularity
    // In a production app, you would aggregate match data to calculate these rates

    const championsWithStats = await Promise.all(
      champions.map(async (champion) => {
        try {
          // In a real implementation, you would calculate these stats from match data
          // For now, we'll use the champion's popularity from their mastery data
          // or generate reasonable random values

          // This is a simplified approach - in a real app, you would:
          // 1. Collect match data over time
          // 2. Calculate win rates, pick rates, and ban rates from that data
          // 3. Store these calculations in a database

          return {
            ...champion,
            roles: mapTagsToRoles(champion.tags),
            winRate: (48 + Math.random() * 8).toFixed(1), // Random win rate between 48-56%
            pickRate: (2 + Math.random() * 15).toFixed(1), // Random pick rate between 2-17%
            banRate: (1 + Math.random() * 20).toFixed(1), // Random ban rate between 1-21%
          }
        } catch (error) {
          console.error(`Error fetching stats for champion ${champion.id}:`, error.message)
          return {
            ...champion,
            roles: mapTagsToRoles(champion.tags),
            winRate: "50.0",
            pickRate: "5.0",
            banRate: "3.0",
          }
        }
      }),
    )

    // Cache the result for 1 hour (3600 seconds)
    cache.set(cacheKey, championsWithStats, 3600)

    res.json(championsWithStats)
  } catch (error) {
    console.error("Error fetching champions:", error.message)
    res.status(500).json({ error: "Failed to fetch champions" })
  }
})

// Get champion details by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Check cache first
    const cacheKey = `champion:${id}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Fetch latest version
    const versionsResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
    const latestVersion = versionsResponse.data[0]

    // Fetch champion data
    const championResponse = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion/${id}.json`,
    )

    if (!championResponse.data.data[id]) {
      return res.status(404).json({ error: "Champion not found" })
    }

    const championData = championResponse.data.data[id]

    // Process champion data
    const champion = {
      id: championData.id,
      name: championData.name,
      title: championData.title,
      lore: championData.lore,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championData.image.full}`,
      splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData.id}_0.jpg`,
      loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championData.id}_0.jpg`,
      tags: championData.tags,
      roles: mapTagsToRoles(championData.tags),
      stats: championData.stats,
      spells: championData.spells.map((spell) => ({
        id: spell.id,
        name: spell.name,
        description: spell.description,
        image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${spell.image.full}`,
      })),
      passive: {
        name: championData.passive.name,
        description: championData.passive.description,
        image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/passive/${championData.passive.image.full}`,
      },
    }

    // Fetch champion statistics
    // In a real implementation, you would calculate these from match data
    // For now, we'll generate reasonable random values
    const championWithStats = {
      ...champion,
      winRate: (48 + Math.random() * 8).toFixed(1),
      pickRate: (2 + Math.random() * 15).toFixed(1),
      banRate: (1 + Math.random() * 20).toFixed(1),
    }

    // Cache the result for 1 hour (3600 seconds)
    cache.set(cacheKey, championWithStats, 3600)

    res.json(championWithStats)
  } catch (error) {
    console.error("Error fetching champion details:", error.message)

    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Champion not found" })
    }

    res.status(500).json({ error: "Failed to fetch champion details" })
  }
})

// Helper function to map Riot's tags to roles
function mapTagsToRoles(tags) {
  const roleMap = {
    Fighter: ["TOP", "JUNGLE"],
    Tank: ["TOP", "SUPPORT"],
    Mage: ["MID"],
    Assassin: ["MID", "JUNGLE"],
    Marksman: ["ADC"],
    Support: ["SUPPORT"],
  }

  // Get all possible roles based on tags
  const roles = tags.flatMap((tag) => roleMap[tag] || [])

  // Remove duplicates
  return [...new Set(roles)]
}

// Get champion stats (win rates, pick rates, etc.)
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params

    // Check cache first
    const cacheKey = `champion:${id}:stats`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // In a real implementation, you would:
    // 1. Query your database for match data involving this champion
    // 2. Calculate win rates, pick rates, ban rates, etc.
    // 3. Return the calculated statistics

    // For this implementation, we'll generate reasonable random values
    const stats = {
      id,
      winRate: (48 + Math.random() * 8).toFixed(1),
      pickRate: (2 + Math.random() * 15).toFixed(1),
      banRate: (1 + Math.random() * 20).toFixed(1),
      roleDistribution: {
        TOP: Math.random() * 100,
        JUNGLE: Math.random() * 100,
        MID: Math.random() * 100,
        ADC: Math.random() * 100,
        SUPPORT: Math.random() * 100,
      },
      counters: [
        { id: "Darius", name: "Darius", winRate: 45 + Math.random() * 10 },
        { id: "Fiora", name: "Fiora", winRate: 46 + Math.random() * 10 },
        { id: "Riven", name: "Riven", winRate: 47 + Math.random() * 10 },
      ],
      synergies: [
        { id: "Amumu", name: "Amumu", winRate: 53 + Math.random() * 10 },
        { id: "Malphite", name: "Malphite", winRate: 52 + Math.random() * 10 },
        { id: "Orianna", name: "Orianna", winRate: 51 + Math.random() * 10 },
      ],
    }

    // Cache the result for 1 hour (3600 seconds)
    cache.set(cacheKey, stats, 3600)

    res.json(stats)
  } catch (error) {
    console.error("Error fetching champion stats:", error.message)
    res.status(500).json({ error: "Failed to fetch champion stats" })
  }
})

module.exports = router
