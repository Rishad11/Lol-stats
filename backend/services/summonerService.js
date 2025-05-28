// services/summonerService.js
const axios = require("axios");

// Summoner-v4 hosts
const regionToHost = {
  na:  "na1.api.riotgames.com", // allow both "na" and "na1"
  na1: "na1.api.riotgames.com",
  euw1: "euw1.api.riotgames.com",
  eun1: "eun1.api.riotgames.com",
  kr:   "kr.api.riotgames.com",
  jp1:  "jp1.api.riotgames.com",
  br1:  "br1.api.riotgames.com",
  la1:  "la1.api.riotgames.com",
  la2:  "la2.api.riotgames.com",
  oc1:  "oc1.api.riotgames.com",
  ru:   "ru.api.riotgames.com",
  tr1:  "tr1.api.riotgames.com",
};

// account-v1 clusters
const platformToCluster = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  oc1: "americas",
  euw1: "europe",
  eun1: "europe",
  ru:   "europe",
  tr1:  "europe",
  kr:   "asia",
  jp1:  "asia",
};

/**
 * Summoner-v4 by PUUID → full Summoner DTO (including .name)
 */
async function fetchSummonerByPUUID(regionKey, puuid) {
  const host = regionToHost[regionKey.toLowerCase()];
  if (!host) throw new Error(`Invalid region for Summoner lookup: ${regionKey}`);

  const url = `https://${host}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const { data } = await axios.get(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });
  return data;
}

/**
 * Summoner-v4 by Summoner ID → full Summoner DTO (including .name)
 */
async function fetchSummonerById(regionKey, summonerId) {
  const host = regionToHost[regionKey.toLowerCase()];
  if (!host) throw new Error(`Invalid region for Summoner lookup: ${regionKey}`);

  const url = `https://${host}/lol/summoner/v4/summoners/${summonerId}`;
  const { data } = await axios.get(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });
  return data;
}

/**
 * account-v1 by PUUID → Riot Account { gameName, tagLine }
 */
async function fetchRiotIdByPUUID(platformCode, puuid) {
  const cluster = platformToCluster[platformCode.toLowerCase()];
  if (!cluster) throw new Error(`Invalid platform for account lookup: ${platformCode}`);

  const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`;
  const { data } = await axios.get(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });
  return { gameName: data.gameName, tagLine: data.tagLine };
}

module.exports = {
  fetchSummonerByPUUID,
  fetchSummonerById,
  fetchRiotIdByPUUID,
};
