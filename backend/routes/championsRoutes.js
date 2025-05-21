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
      tags: champion.tags,
    }))

    // Cache the result for 24 hours (86400 seconds)
    cache.set(cacheKey, champions, 86400)

    res.json(champions)
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

    const championData = championResponse.data.data[id]

    // Process champion data
    const champion = {
      id: championData.id,
      name: championData.name,
      title: championData.title,
      lore: championData.lore,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championData.image.full}`,
      splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData.id}_0.jpg`,
      tags: championData.tags,
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

    // Cache the result for 24 hours (86400 seconds)
    cache.set(cacheKey, champion, 86400)

    res.json(champion)
  } catch (error) {
    console.error("Error fetching champion details:", error.message)

    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Champion not found" })
    }

    res.status(500).json({ error: "Failed to fetch champion details" })
  }
})

// Get champion stats (win rates, pick rates, etc.)
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params

    // In a real app, this would fetch data from a database or third-party API
    // For this MVP, we'll return mock data

    const mockStats = {
      id,
      winRate: 50 + (Math.random() * 5 - 2.5),
      pickRate: 5 + Math.random() * 10,
      banRate: 2 + Math.random() * 8,
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

    res.json(mockStats)
  } catch (error) {
    console.error("Error fetching champion stats:", error.message)
    res.status(500).json({ error: "Failed to fetch champion stats" })
  }
})

module.exports = router
