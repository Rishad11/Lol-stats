const express = require("express")
const router = express.Router()
const ddragonService = require("../services/ddragonService")
const wrapAsync = require("../middleware/wrapAsync")
const validateVersion = require("../middleware/validateVersion")

// Get Data Dragon versions
router.get(
  "/versions",
  wrapAsync(async (req, res) => {
    const versions = await ddragonService.getVersions()
    res.json(versions)
  }),
)

// Get current version
router.get(
  "/version/current",
  wrapAsync(async (req, res) => {
    const version = await ddragonService.getCurrentVersion()
    res.json({ version })
  }),
)

// Get all champions
router.get(
  "/champions",
  validateVersion,
  wrapAsync(async (req, res) => {
    const { version } = req.query
    const champions = await ddragonService.getChampions(version)
    res.json(champions)
  }),
)

// Get specific champion
router.get(
  "/champions/:championId",
  validateVersion,
  wrapAsync(async (req, res) => {
    const { championId } = req.params
    const { version } = req.query
    const champion = await ddragonService.getChampion(championId, version)
    res.json(champion)
  }),
)

// Get summoner spells
router.get(
  "/summoner-spells",
  validateVersion,
  wrapAsync(async (req, res) => {
    const { version } = req.query
    const spells = await ddragonService.getSummonerSpells(version)
    res.json(spells)
  }),
)

// Get items
router.get(
  "/items",
  validateVersion,
  wrapAsync(async (req, res) => {
    const { version } = req.query
    const items = await ddragonService.getItems(version)
    res.json(items)
  }),
)

// Get runes
router.get(
  "/runes",
  validateVersion,
  wrapAsync(async (req, res) => {
    const { version } = req.query
    const runes = await ddragonService.getRunes(version)
    res.json(runes)
  }),
)

// Get profile icons
router.get(
  "/profile-icons",
  validateVersion,
  wrapAsync(async (req, res) => {
    const { version } = req.query
    const icons = await ddragonService.getProfileIcons(version)
    res.json(icons)
  }),
)

// Get asset URLs for a specific version
router.get(
  "/assets/urls",
  validateVersion,
  wrapAsync(async (req, res) => {
    const { version } = req.query
    const currentVersion = version || (await ddragonService.getCurrentVersion())
    const urls = ddragonService.getAssetUrls(currentVersion)
    res.json({ version: currentVersion, urls })
  }),
)

module.exports = router
