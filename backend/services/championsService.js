const axios = require("axios");
const cache = require("../utils/cache");

async function getAllChampions() {
  const cacheKey = "champions:all";
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  const versionsResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
  const latestVersion = versionsResponse.data[0];

  const championsResponse = await axios.get(
    `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
  );
  const championsData = championsResponse.data.data;

  const champions = Object.values(championsData).map((champion) => ({
    id: champion.id,
    name: champion.name,
    title: champion.title,
    blurb: champion.blurb,
    image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`,
    tags: champion.tags,
  }));

  cache.set(cacheKey, champions, 3600);
  return champions;
}

async function getChampionDetails(id) {
  const cacheKey = `champion:${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  const versionsResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
  const latestVersion = versionsResponse.data[0];

  const championResponse = await axios.get(
    `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion/${id}.json`
  );

  if (!championResponse.data.data[id]) {
    return null;
  }

  const championData = championResponse.data.data[id];

  const champion = {
    id: championData.id,
    name: championData.name,
    title: championData.title,
    lore: championData.lore,
    blurb: championData.blurb,
    image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championData.image.full}`,
    splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData.id}_0.jpg`,
    loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championData.id}_0.jpg`,
    tags: championData.tags,
    stats: championData.stats,
    spells: championData.spells.map((spell) => ({
      id: spell.id,
      name: spell.name,
      description: spell.description,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${spell.image.full}`,
    })),
    passive: {
      name: championData.passive.name,
      description: championData.passive.description,
      image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/passive/${championData.passive.image.full}`,
    },
  };

  cache.set(cacheKey, champion, 3600);
  return champion;
}

module.exports = {
  getAllChampions,
  getChampionDetails,
};
