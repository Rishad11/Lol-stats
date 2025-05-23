const express = require("express")
const router = express.Router()
const cache = require("../utils/cache")

// Get all available regions
router.get("/", (req, res) => {
  try {
    // Check cache first
    const cacheKey = "regions:all"
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Define available regions
    // These are the official Riot Games API regions
    const regions = [
      {
        code: "na1",
        name: "North America",
        shortName: "NA",
        continent: "americas",
      },
      {
        code: "euw1",
        name: "Europe West",
        shortName: "EUW",
        continent: "europe",
      },
      {
        code: "eun1",
        name: "Europe Nordic & East",
        shortName: "EUNE",
        continent: "europe",
      },
      {
        code: "kr",
        name: "Korea",
        shortName: "KR",
        continent: "asia",
      },
      {
        code: "jp1",
        name: "Japan",
        shortName: "JP",
        continent: "asia",
      },
      {
        code: "br1",
        name: "Brazil",
        shortName: "BR",
        continent: "americas",
      },
      {
        code: "la1",
        name: "Latin America North",
        shortName: "LAN",
        continent: "americas",
      },
      {
        code: "la2",
        name: "Latin America South",
        shortName: "LAS",
        continent: "americas",
      },
      {
        code: "oc1",
        name: "Oceania",
        shortName: "OCE",
        continent: "sea",
      },
      {
        code: "ru",
        name: "Russia",
        shortName: "RU",
        continent: "europe",
      },
      {
        code: "tr1",
        name: "Turkey",
        shortName: "TR",
        continent: "europe",
      },
    ]

    // Cache the result for 24 hours (86400 seconds)
    cache.set(cacheKey, regions, 86400)

    res.json(regions)
  } catch (error) {
    console.error("Error fetching regions:", error.message)
    res.status(500).json({ error: "Failed to fetch regions" })
  }
})

module.exports = router
