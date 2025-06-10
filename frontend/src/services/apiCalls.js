import axios from "axios"

// DDragon API calls
export const fetchVersions = async () => {
  try {
    const response = await axios.get("/api/ddragon/versions")
    return response.data
  } catch (error) {
    console.error("Error fetching versions:", error)
    throw error
  }
}

export const fetchCurrentVersion = async () => {
  try {
    const response = await axios.get("/api/ddragon/version/current")
    return response.data.version
  } catch (error) {
    console.error("Error fetching current version:", error)
    throw error
  }
}

export const fetchChampions = async (version = null) => {
  try {
    const url = version ? `/api/ddragon/champions?version=${version}` : `/api/ddragon/champions`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching champions:", error)
    throw error
  }
}

export const fetchChampion = async (championId, version = null) => {
  try {
    const url = version
      ? `/api/ddragon/champions/${championId}?version=${version}`
      : `/api/ddragon/champions/${championId}`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error(`Error fetching champion ${championId}:`, error)
    throw error
  }
}

export const fetchSummonerSpells = async (version = null) => {
  try {
    const url = version ? `/api/ddragon/summoner-spells?version=${version}` : `/api/ddragon/summoner-spells`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching summoner spells:", error)
    throw error
  }
}

export const fetchItems = async (version = null) => {
  try {
    const url = version ? `/api/ddragon/items?version=${version}` : `/api/ddragon/items`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching items:", error)
    throw error
  }
}

export const fetchRunes = async (version = null) => {
  try {
    const url = version ? `/api/ddragon/runes?version=${version}` : `/api/ddragon/runes`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching runes:", error)
    throw error
  }
}

export const fetchAssetUrls = async (version = null) => {
  try {
    const url = version ? `/api/ddragon/assets/urls?version=${version}` : `/api/ddragon/assets/urls`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching asset URLs:", error)
    throw error
  }
}

// Existing API calls (keep these as they are)
export const fetchSummoner = async (region, summonerName) => {
  try {
    const response = await axios.get(`/api/summoner/${region}/${encodeURIComponent(summonerName)}`)
    return response.data
  } catch (error) {
    console.error("Error fetching summoner:", error)
    throw error
  }
}
