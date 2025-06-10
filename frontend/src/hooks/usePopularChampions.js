"use client"

import { useEffect, useState } from "react"
import { getChampions } from "../services/ddragonService"
import { useDataDragon } from "./useDataDragon"

export const usePopularChampions = (count = 5) => {
  const { version, loading: ddLoading } = useDataDragon()
  const [popularChampions, setPopularChampions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      if (!version || typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
        setLoading(false)
        setError("Data Dragon version not loaded yet.")
        return
      }
      try {
        setLoading(true)
        setError(null)
        const championsResponse = await getChampions(version)
        const championsData = Object.values(championsResponse.data.data)
        // Sort and slice as before
        const sortedChampions = championsData
          .sort((a, b) => Number.parseFloat(b.pickRate || 0) - Number.parseFloat(a.pickRate || 0))
          .slice(0, count)
        if (!cancelled) setPopularChampions(sortedChampions)
      } catch (error) {
        if (!cancelled) setError(error.message || "Failed to load data. Please try again later.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [version, count])

  return { popularChampions, loading, error, ddLoading }
}
