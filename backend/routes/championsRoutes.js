const express = require("express")
const { getAllChampions, getChampionDetails } = require("../services/championsService")

const router = express.Router()

// Get all champions
router.get("/", async (req, res) => {
  try {
    const champions = await getAllChampions()
    res.json(champions)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch champions" })
  }
})

// Get champion details by ID
router.get("/:id", async (req, res) => {
  try {
    const champion = await getChampionDetails(req.params.id)
    if (!champion) {
      return res.status(404).json({ error: "Champion not found" })
    }
    res.json(champion)
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Champion not found" })
    }
    res.status(500).json({ error: "Failed to fetch champion details" })
  }
})

module.exports = router
