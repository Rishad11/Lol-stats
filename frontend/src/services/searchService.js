import api from "./api"

export const searchChampions = (query) => {
  return api.get("/search/champions", { params: { query } })
}

export const searchSummoners = (region, query) => {
  return api.get(`/search/summoners/${region}`, { params: { query } })
}
