"use client"

import { useState, useEffect } from "react"
import { getChampionMastery } from "../services/summonerService"

export const useChampionMastery = (region, puuid) => {
  const [championMastery, setChampionMastery] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChampionMastery = async () => {
      if (!region || !puuid) return

      try {
        setLoading(true)
        setError(null)

        const response = await getChampionMastery(region, puuid)
        setChampionMastery(response.data || [])
      } catch (err) {
        console.error("Error fetching champion mastery:", err)
        setError("Failed to load champion mastery data")
        setChampionMastery([])
      } finally {
        setLoading(false)
      }
    }

    if (region && puuid) {
      fetchChampionMastery()
    }
  }, [region, puuid])

  return { championMastery, loading, error }
}
