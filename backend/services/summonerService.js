// services/summonerService.js
const axios = require("axios");
const cache = require("../utils/cache");
const { regionToHost } = require("../utils/regions");
const { riotHeaders, delay, getPlatformRegion } = require("../utils/riotHelpers");

// ----- Service: Get summoner by name -----
async function getSummonerByName(region, summonerName) {
  region = region.toLowerCase();
  const response = await axios.get(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
    { headers: riotHeaders() }
  );
  return response.data;
}

// ----- Service: Get summoner by PUUID -----
async function getSummonerByPUUID(region, puuid) {
  const host = regionToHost[region.toLowerCase()];
  if (!host) throw new Error(`Invalid region for Summoner lookup: ${region}`);
  const url = `https://${host}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const { data } = await axios.get(url, { headers: riotHeaders() });
  return data;
}

// ----- Service: Get rank data by summoner ID -----
async function getRankData(region, summonerId) {
  region = region.toLowerCase();
  const response = await axios.get(
    `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
    { headers: riotHeaders() }
  );
  return response.data;
}

// ----- Service: Get detailed match history by PUUID -----
async function getMatchHistoryByPUUID(region, puuid) {
  region = region.toLowerCase();
  const platformRegion = getPlatformRegion(region);

  const matchIdsResponse = await axios.get(
    `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
    { headers: riotHeaders() }
  );
  const matchIds = matchIdsResponse.data;
  const matchDetails = [];

  for (const matchId of matchIds) {
    const matchResponse = await axios.get(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      { headers: riotHeaders() }
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
      queueId: match.info.queueId,
      items: [
        player.item0, player.item1, player.item2,
        player.item3, player.item4, player.item5,
        player.item6
      ],
    });
    await delay(100);
  }
  return matchDetails;
}

// ----- Service: Get full match details -----
async function getFullMatchDetails(region, matchId) {
  const platformRegion = getPlatformRegion(region);
  const matchResponse = await axios.get(
    `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    { headers: riotHeaders() }
  );
  return matchResponse.data;
}

// ----- Service: Get ranked matches (custom route) -----
async function getRankedMatches(region, puuid, start, count) {
  const platformRegion = getPlatformRegion(region);
  const matchIdsResponse = await axios.get(
    `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
    { headers: riotHeaders() }
  );
  const matchIds = matchIdsResponse.data;
  const matches = [];
  for (const matchId of matchIds) {
    try {
      const matchResponse = await axios.get(
        `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers: riotHeaders() }
      );
      const match = matchResponse.data;
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
    }
    await delay(110);
  }
  return matches;
}

// ----- Service: Champion mastery -----
async function getChampionMastery(region, puuid) {
  const cacheKey = `mastery:p:${region}:${puuid}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const platform = region.toLowerCase();
  if (!regionToHost[platform]) {
    const error = new Error("Invalid region");
    error.status = 400;
    throw error;
  }

  // 1) Fetch all mastery entries by PUUID
  const masteryRes = await axios.get(
    `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=10`,
    { headers: riotHeaders() }
  );

  // 2) Map championId → championName via DDragon
  const ddRes = await axios.get(
    "https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion.json"
  );
  const champs = ddRes.data.data;
  const champMap = {};
  Object.values(champs).forEach((c) => (champMap[c.key] = c.id));

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
  return masteryData;
}


 // account-v1 by PUUID → Riot Account { gameName, tagLine }
async function fetchRiotIdByPUUID(regionKey, puuid) {
  const { regionToCluster } = require("../utils/regions");
  const { riotHeaders } = require("../utils/riotHelpers");
  let cluster = regionToCluster[regionKey.toLowerCase()];
  if (!cluster) {
    cluster = regionKey.toLowerCase();
  }
  const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`;
  const { data } = await require("axios").get(url, {
    headers: riotHeaders(),
  });
  return { gameName: data.gameName, tagLine: data.tagLine };
}

module.exports = {
  getSummonerByName,
  getSummonerByPUUID,
  getRankData,
  getMatchHistoryByPUUID,
  getFullMatchDetails,
  getRankedMatches,
  getChampionMastery,
  fetchRiotIdByPUUID,
};
