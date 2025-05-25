const express = require("express");
const axios = require("axios");
const cache = require("../utils/cache");
const { getMatchIdsByPUUID, getMatchDetails } = require("../services/riotApi");

const router = express.Router();

// Helper for delaying
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ----- Get summoner by name -----
router.get("/:region/:summonerName", async (req, res) => {
  const { region, summonerName } = req.params;
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching summoner by name:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" });
  }
});

// ----- Get summoner by PUUID -----
router.get("/by-puuid/:region/:puuid", async (req, res) => {
  const { region, puuid } = req.params;
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching summoner by PUUID:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" });
  }
});

// ----- Get rank data by summoner ID -----
router.get("/:region/:summonerId/rank", async (req, res) => {
  const { region, summonerId } = req.params;
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching rank data:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" });
  }
});

// ----- Get detailed match history by PUUID -----
router.get("/:region/:puuid/matches", async (req, res) => {
  const { region, puuid } = req.params;
  try {
    const platformRegion =
      region.startsWith("euw") || region.startsWith("eune") || region.startsWith("tr") || region.startsWith("ru")
        ? "europe"
        : region.startsWith("na") || region.startsWith("br") || region.startsWith("lan") || region.startsWith("las")
        ? "americas"
        : "asia";

    const matchIdsResponse = await axios.get(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    const matchIds = matchIdsResponse.data;
    const matchDetails = [];

    for (const matchId of matchIds) {
      const matchResponse = await axios.get(
        `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
      );
      const match = matchResponse.data;
      const player = match.info.participants.find((p) => p.puuid === puuid);
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
      });
      await delay(100);
    }
    res.json(matchDetails);
  } catch (error) {
    console.error("Error fetching match history:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" });
  }
});

// ----- Get full match details -----
router.get("/:region/match/:matchId/details", async (req, res) => {
  const { region, matchId } = req.params;
  try {
    const platformRegion =
      region.startsWith("euw") || region.startsWith("eune") || region.startsWith("tr") || region.startsWith("ru")
        ? "europe"
        : region.startsWith("na") || region.startsWith("br") || region.startsWith("lan") || region.startsWith("las")
        ? "americas"
        : "asia";
    const matchResponse = await axios.get(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    res.json(matchResponse.data);
  } catch (error) {
    console.error("Error fetching full match details:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Internal server error" });
  }
});

// ----- Get ranked matches (custom route) -----
router.get("/:region/:puuid/ranked-matches", async (req, res) => {
  const { region, puuid } = req.params;
  const start = parseInt(req.query.start || "0", 10);
  const count = parseInt(req.query.count || "10", 10);
  try {
    const matchIds = await getMatchIdsByPUUID(region, puuid, start, count);
    const matches = [];
    for (const matchId of matchIds) {
      try {
        const match = await getMatchDetails(region, matchId);
        const participant = match.info.participants.find((p) => p.puuid === puuid);
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
          });
        }
      } catch (err) {
        console.warn(`Skipped match ${matchId}: ${err.message}`);
      }
      await delay(110);
    }
    res.json(matches);
  } catch (err) {
    console.error("Error fetching ranked matches:", err.message);
    res.status(500).json({ error: "Failed to fetch ranked matches" });
  }
});

// ----- Champion wins: aggregated, throttled, cached -----
router.get("/:region/:puuid/champion-wins", async (req, res) => {
  const { region, puuid } = req.params;
  const cacheKey = `champWins:${region}:${puuid}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  // 1) Fetch IDs (single call, with one retry-on-429)
  let matchIds;
  try {
    matchIds = await getMatchIdsByPUUID(region, puuid, 0, 70);
  } catch (err) {
    if (err.response?.status === 429) {
      const ra = parseInt(err.response.headers["retry-after"] || "1", 10);
      console.warn(`IDs call 429, sleeping ${ra+1}s then retrying`);
      await delay((ra + 1) * 1000);
      matchIds = await getMatchIdsByPUUID(region, puuid, 0, 70);
    } else {
      console.error("Failed fetching match IDs:", err);
      return res.status(500).json({ error: "Could not fetch match IDs" });
    }
  }

  const stats = {};
  const BASE_DELAY = 1250; // ms between detail calls

  // 2) Fetch details for each match, throttled
  for (const id of matchIds) {
    let retried = false;
    while (true) {
      try {
        const match = await getMatchDetails(region, id);
        const p = match.info.participants.find((p) => p.puuid === puuid);
        if (p) {
          stats[p.championName] ??= { games: 0, wins: 0 };
          stats[p.championName].games++;
          if (p.win) stats[p.championName].wins++;
        }
        break;
      } catch (err) {
        if (err.response?.status === 429 && !retried) {
          const ra = parseInt(err.response.headers["retry-after"] || "1", 10);
          console.warn(`Detail call 429 on ${id}, sleeping ${ra+1}s then retrying`);
          await delay((ra + 1) * 1000);
          retried = true;
          continue;
        }
        console.warn(`Skipping match ${id}:`, err.response?.status || err.message);
        break;
      }
    }
    await delay(BASE_DELAY);
  }

  // 3) Cache & return
  const result = Object.entries(stats).map(([champion, d]) => ({ champion, ...d }));
  cache.set(cacheKey, result, 300); // cache 5m
  res.json(result);
});
module.exports = router;
