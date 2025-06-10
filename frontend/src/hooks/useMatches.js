"use client"

import { useState, useEffect } from "react"
import { getMatches } from "../services/summonerService"

export const useMatches = (region, puuid, count = 10) => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMatches = async () => {
      if (!region || !puuid) return

      try {
        setLoading(true)
        setError(null)

        const response = await getMatches(region, puuid, count)
        setMatches(response.data || [])
      } catch (err) {
        console.error("Error fetching matches:", err)
        setError("Failed to load match history")
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    if (region && puuid) {
      fetchMatches()
    }
  }, [region, puuid, count])

  return { matches, loading, error }
}
