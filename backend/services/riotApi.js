const axios = require("axios")
const RIOT_API_KEY = process.env.RIOT_API_KEY
const headers = { "X-Riot-Token": RIOT_API_KEY }

const getMatchIdsByPUUID = async (region, puuid, start = 0, count = 10) => {
  const platform = region.toLowerCase().startsWith("na") ? "americas" : "europe"
  const url = `https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=${start}&count=${count}`
  const response = await axios.get(url, { headers })
  return response.data
}

const getMatchDetails = async (region, matchId) => {
  const platform = region.toLowerCase().startsWith("na") ? "americas" : "europe"
  const url = `https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`
  const response = await axios.get(url, { headers })
  return response.data
}

module.exports = {
  getMatchIdsByPUUID,
  getMatchDetails,
}
