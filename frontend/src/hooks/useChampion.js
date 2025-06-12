"use client"

import { useState, useEffect } from "react"
import { getChampion } from "../services/ddragonService"

export const useChampion = (championId, version) => {
  const [champion, setChampion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChampionDetails = async () => {
      if (!version || !championId) return

      try {
        setLoading(true)
        setError(null)

        const response = await getChampion(championId, version)
        let champData = null
        if (response.data) {
          // If response.data.data exists (ddragon format), use that
          if (response.data.data && typeof response.data.data === "object") {
            // Try direct match
            champData = response.data.data[championId]
            // Try case-insensitive match
            if (!champData) {
              const foundKey = Object.keys(response.data.data).find(
                (key) => key.toLowerCase() === championId.toLowerCase()
              )
              if (foundKey) champData = response.data.data[foundKey]
            }
            if (champData) {
              setChampion({ data: { [champData.id]: champData } })
              setLoading(false)
              return
            }
          }
          // If response.data is a single champion object (not wrapped)
          if (response.data.id && (
            response.data.id === championId || response.data.id.toLowerCase() === championId.toLowerCase()
          )) {
            setChampion({ data: { [response.data.id]: response.data } })
            setLoading(false)
            return
          }
        }
        setError("Champion not found")
      } catch (error) {
        console.error("Error fetching champion details:", error)
        setError("Failed to load champion details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (version && championId) {
      fetchChampionDetails()
    }
  }, [championId, version])

  return { champion, loading, error }
}
