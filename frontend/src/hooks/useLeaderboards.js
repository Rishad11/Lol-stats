"use client"

import { useState, useEffect } from "react"
import { getLeaderboards } from "../services/leaderboardService"

export const useLeaderboards = (region, limit = 10) => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboards = async () => {
      if (!region) return

      try {
        setLoading(true)
        setError(null)

        const response = await getLeaderboards(region, limit)
        setPlayers(response.data || [])
      } catch (error) {
        console.error("Error fetching leaderboards:", error)
        setError("Failed to load leaderboards")
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }

    if (region) {
      fetchLeaderboards()
    }
  }, [region, limit])

  return { players, loading, error }
}
