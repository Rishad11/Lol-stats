import api from "./api"

// Fix: Remove extra /api prefix. Use only /leaderboards/... because api.js already sets baseURL to /api
export const getLeaderboards = (region, limit = 10) => {
  return api.get(`/leaderboards/${region}`, { params: { limit } })
}
