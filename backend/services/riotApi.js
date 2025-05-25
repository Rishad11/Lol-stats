// services/riotApi.js

const axios = require('axios');

function platformFor(region) {
  if (/^(euw|eune|tr|ru)/.test(region)) return 'europe';
  if (/^(na|br|lan|las)/.test(region)) return 'americas';
  return 'asia';
}

async function getMatchIdsByPUUID(region, puuid, start = 0, count = 100) {
  const platform = platformFor(region);
  const url = `https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;
  const res = await axios.get(url, {
    params: { start, count, queue: 420 },
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
  });
  return res.data;  // <-- this is now an array of matchId strings
}

async function getMatchDetails(region, matchId) {
  const platform = platformFor(region);
  const url = `https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const res = await axios.get(url, {
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
  });
  return res.data;
}

module.exports = { getMatchIdsByPUUID, getMatchDetails };
