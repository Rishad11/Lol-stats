import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Add a request interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network Error:", error.message)
      return Promise.reject(new Error("Network error. Please check your connection."))
    }

    // Handle API errors
    const { status, data } = error.response

    switch (status) {
      case 404:
        console.error("Resource not found:", data)
        return Promise.reject(new Error(data.error || "Resource not found"))
      case 429:
        console.error("Rate limit exceeded:", data)
        return Promise.reject(new Error("Too many requests. Please try again later."))
      case 500:
        console.error("Server error:", data)
        return Promise.reject(new Error("Server error. Please try again later."))
      default:
        console.error(`Error ${status}:`, data)
        return Promise.reject(error)
    }
  },
)

// Region endpoints
export const getRegions = () => {
  return api.get("/regions")
}

// Search endpoints
export const searchChampions = (query) => {
  return api.get("/search/champions", { params: { query } })
}

export const searchSummoners = (region, query) => {
  return api.get(`/search/summoners/${region}`, { params: { query } })
}

// Summoner endpoints
export const getSummoner = (region, summonerName) => {
  return api.get(`/summoner/${region}/${summonerName}`)
}

export const getMatches = (region, puuid, count = 10) => {
  return api.get(`/summoner/${region}/${puuid}/matches`, { params: { count } })
}

// Champions endpoints
export const getChampions = () => {
  return api.get("/champions")
}

export const getChampionDetails = (championId) => {
  return api.get(`/champions/${championId}`)
}

export const getChampionStats = (championId) => {
  return api.get(`/champions/${championId}/stats`)
}

// Leaderboards endpoints
export const getLeaderboards = (region) => {
  return api.get(`/leaderboards/${region}`)
}

export default api
