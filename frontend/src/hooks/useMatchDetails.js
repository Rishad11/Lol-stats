"use client"

import { useState } from "react"
import { getMatchDetails } from "../services/summonerService"

export const useMatchDetails = () => {
  const [matchDetails, setMatchDetails] = useState({})
  const [loading, setLoading] = useState({})
  const [error, setError] = useState({})

  const fetchMatchDetails = async (region, matchId) => {
    if (!region || !matchId) return null

    try {
      setLoading((prev) => ({ ...prev, [matchId]: true }))
      setError((prev) => ({ ...prev, [matchId]: null }))

      const response = await getMatchDetails(region, matchId)

      setMatchDetails((prev) => ({
        ...prev,
        [matchId]: { data: response.data, expanded: true },
      }))

      return response.data
    } catch (err) {
      console.error("Error fetching match details", err)
      setError((prev) => ({
        ...prev,
        [matchId]: "Failed to load match details",
      }))
      return null
    } finally {
      setLoading((prev) => ({ ...prev, [matchId]: false }))
    }
  }

  const toggleMatchDetails = (matchId) => {
    setMatchDetails((prev) => {
      const current = prev[matchId]
      if (!current || !current.data) return prev

      return {
        ...prev,
        [matchId]: { ...current, expanded: !current.expanded },
      }
    })
  }

  return {
    matchDetails,
    loading,
    error,
    fetchMatchDetails,
    toggleMatchDetails,
  }
}
