// services/leaderboardsService.js
const axios = require("axios");
const { fetchRiotIdByPUUID } = require("./summonerService");

const regionPlatformMap = {
  na:   "NA1",
  euw:  "EUW1",
  eune: "EUN1",
  kr:   "KR",
  jp:   "JP1",
};

async function getTopPlayersByRegion(region, limit = 50) {
  const platform = regionPlatformMap[region.toLowerCase()];
  if (!platform) throw new Error(`Unsupported region: ${region}`);

  // 1) challenger list
  const url = `https://${platform.toLowerCase()}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`;
  const { data } = await axios.get(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });
  const { tier, entries } = data;

  // 2) resolve Riot IDs via our shared service to get GameName and tagLine
  const players = await Promise.all(
    entries.slice(0, limit).map(async (e, i) => {
      const { gameName, tagLine } = await fetchRiotIdByPUUID(platform, e.puuid);
      return {
        id:           e.summonerId,
        rank:         i + 1,
        name:         `${gameName}#${tagLine}`, // display as GameName#TagLine
        tier,
        leaguePoints: e.leaguePoints,
        wins:         e.wins,
        losses:       e.losses,
      };
    })
  );
  console.log("🏁 Final mapped players for", region, players);
  return players;
}

module.exports = { getTopPlayersByRegion };
