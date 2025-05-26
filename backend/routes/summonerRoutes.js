const express = require("express")
const axios = require("axios")
const cache = require("../utils/cache")
const { getMatchIdsByPUUID, getMatchDetails } = require("../services/riotApi")

const router = express.Router()

// Helper for delaying
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ----- Get summoner by name -----
router.get("/:region/:summonerName", async (req, res) => {
  const { region, summonerName } = req.params
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } },
    )
    res.json(response.data)
  } catch (error) {
    console.error("Error fetching summoner by name:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" })
  }
})

// ----- Get summoner by PUUID -----
router.get("/by-puuid/:region/:puuid", async (req, res) => {
  const { region, puuid } = req.params
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } },
    )
    res.json(response.data)
  } catch (error) {
    console.error("Error fetching summoner by PUUID:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" })
  }
})

// ----- Get rank data by summoner ID -----
router.get("/:region/:summonerId/rank", async (req, res) => {
  const { region, summonerId } = req.params
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } },
    )
    res.json(response.data)
  } catch (error) {
    console.error("Error fetching rank data:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" })
  }
})

// ----- Get detailed match history by PUUID -----
router.get("/:region/:puuid/matches", async (req, res) => {
  const { region, puuid } = req.params
  try {
    const platformRegion =
      region.startsWith("euw") || region.startsWith("eune") || region.startsWith("tr") || region.startsWith("ru")
        ? "europe"
        : region.startsWith("na") || region.startsWith("br") || region.startsWith("lan") || region.startsWith("las")
          ? "americas"
          : "asia"

    const matchIdsResponse = await axios.get(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } },
    )
    const matchIds = matchIdsResponse.data
    const matchDetails = []

    for (const matchId of matchIds) {
      const matchResponse = await axios.get(
        `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } },
      )
      const match = matchResponse.data
      const player = match.info.participants.find((p) => p.puuid === puuid)
      matchDetails.push({
        id: match.metadata.matchId,
        win: player.win,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        cs: player.totalMinionsKilled + player.neutralMinionsKilled,
        gameDuration: match.info.gameDuration,
        gameCreation: match.info.gameStartTimestamp,
        champion: player.championName,
        role: player.teamPosition,
        visionScore: player.visionScore,
        multikill: player.largestMultiKill > 1 ? `${player.largestMultiKill}x` : null,
        gameMode: match.info.gameMode,
      })
      await delay(100)
    }
    res.json(matchDetails)
  } catch (error) {
    console.error("Error fetching match history:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" })
  }
})

// ----- Get full match details -----
router.get("/:region/match/:matchId/details", async (req, res) => {
  const { region, matchId } = req.params
  try {
    const platformRegion =
      region.startsWith("euw") || region.startsWith("eune") || region.startsWith("tr") || region.startsWith("ru")
        ? "europe"
        : region.startsWith("na") || region.startsWith("br") || region.startsWith("lan") || region.startsWith("las")
          ? "americas"
          : "asia"
    const matchResponse = await axios.get(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } },
    )
    res.json(matchResponse.data)
  } catch (error) {
    console.error("Error fetching full match details:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" })
  }
})

// ----- Get ranked matches (custom route) -----
router.get("/:region/:puuid/ranked-matches", async (req, res) => {
  const { region, puuid } = req.params
  const start = Number.parseInt(req.query.start || "0", 10)
  const count = Number.parseInt(req.query.count || "10", 10)
  try {
    const matchIds = await getMatchIdsByPUUID(region, puuid, start, count)
    const matches = []
    for (const matchId of matchIds) {
      try {
        const match = await getMatchDetails(region, matchId)
        const participant = match.info.participants.find((p) => p.puuid === puuid)
        if (participant) {
          matches.push({
            champion: participant.championName,
            win: participant.win,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
            visionScore: participant.visionScore,
            goldEarned: participant.goldEarned,
          })
        }
      } catch (err) {
        console.warn(`Skipped match ${matchId}: ${err.message}`)
      }
      await delay(110)
    }
    res.json(matches)
  } catch (err) {
    console.error("Error fetching ranked matches:", err.message)
    res.status(500).json({ error: "Failed to fetch ranked matches" })
  }
})

// ----- Champion mastery: get all champion masteries for a summoner -----
// routes/summonerRoutes.js
router.get("/:region/:puuid/champion-mastery", async (req, res) => {
  const { region, puuid } = req.params;
  const cacheKey = `mastery:p:${region}:${puuid}`;
  const cached   = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    // 1) Fetch all mastery entries by PUUID
    const masteryRes = await axios.get(
      `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=10`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );

    // 2) (Optional) Map championId → championName via DDragon
    const ddRes    = await axios.get(
      "https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion.json"
    );
    const champs   = ddRes.data.data;
    const champMap = {};
    Object.values(champs).forEach((c) => champMap[c.key] = c.id);

    const masteryData = masteryRes.data.map((m) => ({
      championId: m.championId,
      championName: champMap[m.championId] || `${m.championId}`,
      championLevel: m.championLevel,
      championPoints: m.championPoints,
      lastPlayTime: m.lastPlayTime,
      chestGranted: m.chestGranted,
      tokensEarned: m.tokensEarned,
    }));

    cache.set(cacheKey, masteryData, 300);
    res.json(masteryData);
  } catch (err) {
    console.error("Error fetching mastery by puuid:", err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: err.response?.data || "Failed to fetch mastery" });
  }
});


module.exports = router
