const express = require("express");
const { getSummonerByName, getSummonerByPUUID, getRankData, getMatchHistoryByPUUID, getFullMatchDetails, getRankedMatches, getChampionMastery } = require("../services/summonerService");

const router = express.Router();

// ----- Get summoner by name -----
router.get("/:region/:summonerName", async (req, res) => {
  try {
    const data = await getSummonerByName(req.params.region, req.params.summonerName);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

// ----- Get summoner by PUUID -----
router.get("/by-puuid/:region/:puuid", async (req, res) => {
  try {
    const data = await getSummonerByPUUID(req.params.region, req.params.puuid);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

// ----- Get rank data by summoner ID -----
router.get("/:region/:summonerId/rank", async (req, res) => {
  try {
    const data = await getRankData(req.params.region, req.params.summonerId);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

// ----- Get detailed match history by PUUID -----
router.get("/:region/:puuid/matches", async (req, res) => {
  try {
    const data = await getMatchHistoryByPUUID(req.params.region, req.params.puuid);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

// ----- Get full match details -----
router.get("/:region/match/:matchId/details", async (req, res) => {
  try {
    const data = await getFullMatchDetails(req.params.region, req.params.matchId);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

// ----- Get ranked matches (custom route) -----
router.get("/:region/:puuid/ranked-matches", async (req, res) => {
  try {
    const start = Number.parseInt(req.query.start || "0", 10);
    const count = Number.parseInt(req.query.count || "10", 10);
    const data = await getRankedMatches(req.params.region, req.params.puuid, start, count);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

// ----- Champion mastery: get all champion masteries for a summoner -----
router.get("/:region/:puuid/champion-mastery", async (req, res) => {
  try {
    const data = await getChampionMastery(req.params.region, req.params.puuid);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;
