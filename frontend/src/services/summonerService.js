import api from "./api"

// Summoner endpoints
export const getSummoner = (region, summonerName) => {
  return api.get(`/summoner/${region}/${encodeURIComponent(summonerName)}`)
}

export const getSummonerByPuuid = (region, puuid) => {
  return api.get(`/summoner/by-puuid/${region}/${puuid}`)
}

export const getSummonerRank = (region, summonerId) => {
  return api.get(`/summoner/${region}/${summonerId}/rank`)
}

export const getMatches = (region, puuid, count = 10) => {
  return api.get(`/summoner/${region}/${puuid}/matches`, { params: { count } })
}

export const getMatchDetails = (region, matchId) => {
  return api.get(`/summoner/${region}/match/${matchId}/details`)
}

export const getChampionMastery = (region, puuid) => {
  return api.get(`/summoner/${region}/${puuid}/champion-mastery`)
}

// Account endpoints
export const getAccountByRiotId = (gameName, tagLine) => {
  return api.get(`/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`)
}
