import api from "./api"

// DDragon API calls

// Use only /ddragon/... (not /api/ddragon/...) because api.js already sets baseURL to /api
export const getVersions = () => {
  return api.get("/ddragon/versions")
}

export const getCurrentVersion = () => {
  return api.get("/ddragon/version/current")
}

export const getChampions = (version) => {
  // Only call if version is a valid string like "14.10.1"
  if (!version || typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error("Invalid version format. Expected format: x.y.z")
  }
  return api.get("/ddragon/champions", { params: { version } })
}

export const getChampion = (championId, version = null) => {
  const url = version
    ? `/ddragon/champions/${championId}?version=${version}`
    : `/ddragon/champions/${championId}`
  return api.get(url)
}

export const getSummonerSpells = (version = null) => {
  const url = version ? `/ddragon/summoner-spells?version=${version}` : `/ddragon/summoner-spells`
  return api.get(url)
}

export const getItems = (version = null) => {
  const url = version ? `/ddragon/items?version=${version}` : `/ddragon/items`
  return api.get(url)
}

export const getRunes = (version = null) => {
  const url = version ? `/ddragon/runes?version=${version}` : `/ddragon/runes`
  return api.get(url)
}

export const getAssetUrls = (version = null) => {
  const url = version ? `/ddragon/assets/urls?version=${version}` : `/ddragon/assets/urls`
  return api.get(url)
}
