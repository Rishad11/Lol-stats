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

module.exports = { getMatchIdsByPUUID, getMatchDetails };
