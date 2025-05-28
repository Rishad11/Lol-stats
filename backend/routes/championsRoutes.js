const express = require("express")
const router = express.Router()
const axios = require("axios")
const cache = require("../utils/cache")

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

    // Process champions data - only use Data Dragon API data
    const champions = Object.values(championsData).map((champion) => ({
      id: champion.id,
      name: champion.name,
      title: champion.title,
      blurb: champion.blurb,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`,
      tags: champion.tags, // These are the champion types (Fighter, Tank, Mage, etc.)
    }))

    // Cache the result for 1 hour (3600 seconds)
    cache.set(cacheKey, champions, 3600)

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

    if (!championResponse.data.data[id]) {
      return res.status(404).json({ error: "Champion not found" })
    }

    const championData = championResponse.data.data[id]

    // Process champion data - only use Data Dragon API data
    const champion = {
      id: championData.id,
      name: championData.name,
      title: championData.title,
      lore: championData.lore,
      blurb: championData.blurb,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championData.image.full}`,
      splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData.id}_0.jpg`,
      loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championData.id}_0.jpg`,
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

    // Cache the result for 1 hour (3600 seconds)
    cache.set(cacheKey, champion, 3600)

    res.json(champion)
  } catch (error) {
    console.error("Error fetching champion details:", error.message)

    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Champion not found" })
    }

    res.status(500).json({ error: "Failed to fetch champion details" })
  }
})

module.exports = router
