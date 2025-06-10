"use client"

import { useState, useEffect } from "react"
import { getSummoner, getSummonerByPuuid, getSummonerRank, getAccountByRiotId } from "../services/summonerService"

export const useSummoner = (region, summonerName) => {
  const [summoner, setSummoner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSummonerData = async () => {
      if (!region || !summonerName) return

      try {
        setLoading(true)
        setError(null)
        let summonerData

        if (summonerName.includes("#")) {
          const [gameName, tagLine] = summonerName.split("#")
          const accountResponse = await getAccountByRiotId(gameName, tagLine)
          const { puuid } = accountResponse.data
          const summonerResponse = await getSummonerByPuuid(region, puuid)
          summonerData = summonerResponse.data
          // Store the original searched name for display
          summonerData.searchedName = `${gameName}#${tagLine}`
        } else {
          const summonerResponse = await getSummoner(region, summonerName)
          summonerData = summonerResponse.data
          summonerData.searchedName = summonerName
        }

        const rankResponse = await getSummonerRank(region, summonerData.id)
        summonerData.rank = rankResponse.data?.[0] || null

        if (summonerData.rank) {
          summonerData.totalGames = summonerData.rank.wins + summonerData.rank.losses
          summonerData.winRate = Math.round((summonerData.rank.wins / summonerData.totalGames) * 100)
        }

        setSummoner(summonerData)
      } catch (err) {
        console.error("Error fetching summoner data:", err)
        const errorMessage = err.response?.data?.error || err.message

        if (err.response?.status === 404) {
          setError(`Summoner "${summonerName}" not found in ${region.toUpperCase()} region.`)
        } else if (err.response?.status === 403) {
          setError(`API key invalid or expired. Please check your API key.`)
        } else {
          setError(`Failed to load summoner data: ${errorMessage}`)
        }

        setSummoner(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSummonerData()
  }, [region, summonerName])

  return { summoner, loading, error }
}
