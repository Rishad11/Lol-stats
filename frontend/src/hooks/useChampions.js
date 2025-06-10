"use client"

import { useState, useEffect } from "react"
import { getChampions } from "../services/ddragonService"

export const useChampions = (version) => {
  const [champions, setChampions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChampionsData = async () => {
      if (!version) return // Wait for version to be loaded

      try {
        setLoading(true)
        setError(null)

        const response = await getChampions(version)
        const championsData = Object.values(response.data.data)

        setChampions(championsData)
      } catch (error) {
        console.error("Error fetching champions:", error)
        setError("Failed to load champions. Please try again later.")
        setChampions([])
      } finally {
        setLoading(false)
      }
    }

    if (version) {
      fetchChampionsData()
    }
  }, [version])

  return { champions, loading, error }
}
