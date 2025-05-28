// services/riotApi.js

const axios = require("axios");

function platformFor(region) {
  if (/^(euw|eune|tr|ru)/.test(region)) return "europe";
  if (/^(na|br|lan|las)/.test(region)) return "americas";
  return "asia";
}

/**
 * Fetch a page of match IDs, optionally only after `beginTime`.
 * @param {string} region – e.g. "euw1"
 * @param {string} puuid
 * @param {number} start – pagination offset
 * @param {number} count – how many IDs
 * @param {number} [beginTime] – UNIX ms to only return matches after this time
 */
async function getMatchIdsByPUUID(
  region,
  puuid,
  start = 0,
  count = 100,
  beginTime
) {
  const platform = platformFor(region);
  const url = `https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;

  const params = { start, count, queue: 420 };
  if (beginTime) params.beginTime = beginTime;

  const res = await axios.get(url, {
    params,
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });
  return res.data;
}

async function getMatchDetails(region, matchId) {
  const platform = platformFor(region);
  const url = `https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const res = await axios.get(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });
  return res.data;
}

 /**
  * Fetch Challenger league entries for a given platform.
  * @param {string} platform – e.g. "NA1", "EUW1", etc.
  */
 async function getChallengerLeague(platform) {
   const url = `https://${platform}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`;
   const res = await axios.get(url, {
     headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
   });
   return res.data;
 }

/**
 * Fetch a summoner’s profile by encrypted Summoner ID.
 * @param {string} platform – e.g. "NA1", "EUW1", etc.
 * @param {string} summonerId – encrypted Summoner ID
 */
async function getSummonerById(platform, summonerId) {
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`;
  const res = await axios.get(url, { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } });
  return res.data; // { id, accountId, puuid, name, profileIconId, ... }
}

/**
 * Fetch a summoner's display name by PUUID using the platform's host.
 * @param {string} platform - e.g. "NA1", "EUW1", etc.
 * @param {string} puuid
 * @returns {Promise<string>} the summoner's name
 */
async function getSummonerNameByPUUID(platform, puuid) {
  const host = platform.toLowerCase() + ".api.riotgames.com";
  const url = `https://${host}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  console.log("🔍 Fetching Summoner name:", { platform, puuid, url });
  try {
    const { data } = await axios.get(url, {
      headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
    });
    console.log("✅  Summoner API response name:", data.name);
    return data.name;
  } catch (err) {
    console.error("❌  Summoner API error:", err.response?.status, err.response?.data);
    throw err;
  }
}

module.exports = {
  getMatchIdsByPUUID,
  getMatchDetails,
  getChallengerLeague,
  getSummonerById, // added helper
  getSummonerNameByPUUID, // added helper
};


