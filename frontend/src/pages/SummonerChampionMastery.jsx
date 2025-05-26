"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Award, Star, Gift } from "lucide-react"
import axios from "axios"
import SummonerTabs from "../components/summonertabs"

const SummonerChampionMastery = () => {
  const { region, summonerName } = useParams()
  const [summoner, setSummoner] = useState(null)
  const [championMastery, setChampionMastery] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        let summonerData

        if (summonerName.includes("#")) {
          const [gameName, tagLine] = summonerName.split("#")
          const accountRes = await axios.get(
            `/api/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
          )
          const { puuid } = accountRes.data
          const summonerRes = await axios.get(`/api/summoner/by-puuid/${region}/${puuid}`)
          summonerData = summonerRes.data
        } else {
          const summonerRes = await axios.get(`/api/summoner/${region}/${encodeURIComponent(summonerName)}`)
          summonerData = summonerRes.data
        }

        const rankResponse = await axios.get(`/api/summoner/${region}/${summonerData.id}/rank`)
        summonerData.rank = rankResponse.data?.[0] || null

        if (summonerData.rank) {
          summonerData.totalGames = summonerData.rank.wins + summonerData.rank.losses
          summonerData.winRate = Math.round((summonerData.rank.wins / summonerData.totalGames) * 100)
        }

        setSummoner(summonerData)

        // IMPORTANT: Using summonerData.id (encryptedSummonerId) here per Riot’s API requirements.
        const masteryRes = await axios.get(
           `/api/summoner/${region}/${summonerData.puuid}/champion-mastery`
        )
        setChampionMastery(masteryRes.data || [])
      } catch (err) {
        console.error("Error fetching champion mastery:", err)
        const errorMessage = err.response?.data?.error || err.message

        if (err.response?.status === 404) {
          setError(`Summoner "${summonerName}" not found in ${region.toUpperCase()} region.`)
        } else if (err.response?.status === 403) {
          setError(`API key invalid or expired. Please check your API key.`)
        } else {
          setError(`Failed to load champion mastery: ${errorMessage}`)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [region, summonerName])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toLocaleString()
  }

  const formatLastPlayed = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const getMasteryColor = (level) => {
    switch (level) {
      case 7:
        return "from-yellow-400 to-yellow-600"
      case 6:
        return "from-purple-400 to-purple-600"
      case 5:
        return "from-blue-400 to-blue-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getMasteryIcon = (level) => {
    if (level >= 5) return <Award className="w-4 h-4" />
    return <Star className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Loading champion mastery...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg
                className="fill-current h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!summoner) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-700">Summoner not found</h2>
        </div>
      </div>
    )
  }

  const totalMasteryPoints = championMastery.reduce((sum, champ) => sum + champ.championPoints, 0)
  const level7Champions = championMastery.filter((champ) => champ.championLevel === 7).length
  const level6Champions = championMastery.filter((champ) => champ.championLevel === 6).length
  const level5Champions = championMastery.filter((champ) => champ.championLevel === 5).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      {/* Summoner Profile */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.profileIconId}.png`}
                alt={summoner.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `/placeholder.svg?height=96&width=96&text=${summoner.name.charAt(0)}`
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
              {summoner.summonerLevel}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{summoner.name}</h1>
            <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md">
                <div className="text-sm opacity-80">Rank</div>
                <div className="font-bold">
                  {summoner.rank?.tier} {summoner.rank?.rank}
                </div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <div className="text-sm text-gray-500">LP</div>
                <div className="font-bold">{summoner.rank?.leaguePoints}</div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <div className="text-sm text-gray-500">Win Rate</div>
                <div className="font-bold">{summoner.winRate}%</div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <div className="text-sm text-gray-500">W/L</div>
                <div className="font-bold text-green-500">
                  {summoner.rank?.wins}W <span className="text-red-500">{summoner.rank?.losses}L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <SummonerTabs region={region} summonerName={summonerName} />

      {/* Mastery Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Mastery Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(totalMasteryPoints)}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{level7Champions}</div>
            <div className="text-sm text-gray-500">Level 7</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{level6Champions}</div>
            <div className="text-sm text-gray-500">Level 6</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{level5Champions}</div>
            <div className="text-sm text-gray-500">Level 5</div>
          </div>
        </div>
      </div>

      {/* Champion Mastery */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Champion Mastery</h2>

        {championMastery.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No mastery data found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {championMastery.map((champ) => (
              <div key={champ.championId} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champ.championName}.png`}
                      alt={champ.championName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `/placeholder.svg?height=48&width=48&text=${champ.championName.charAt(0)}`
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{champ.championName}</h3>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getMasteryColor(champ.championLevel)}`}
                    >
                      {getMasteryIcon(champ.championLevel)}
                      Level {champ.championLevel}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mastery Points</span>
                    <span className="font-bold text-blue-600">{formatNumber(champ.championPoints)}</span>
                  </div>

                  {champ.championLevel < 5 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress to Level {champ.championLevel + 1}</span>
                        <span>
                          {formatNumber(champ.championPointsSinceLastLevel)} /{" "}
                          {formatNumber(champ.championPointsSinceLastLevel + champ.championPointsUntilNextLevel)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(champ.championPointsSinceLastLevel / (champ.championPointsSinceLastLevel + champ.championPointsUntilNextLevel)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {champ.championLevel >= 5 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tokens</span>
                      <span className="font-bold">{champ.tokensEarned}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chest</span>
                    <div className="flex items-center gap-1">
                      <Gift className={`w-4 h-4 ${champ.chestGranted ? "text-green-500" : "text-gray-400"}`} />
                      <span className={`text-sm ${champ.chestGranted ? "text-green-500" : "text-gray-400"}`}>
                        {champ.chestGranted ? "Earned" : "Available"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    Last played: {formatLastPlayed(champ.lastPlayTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SummonerChampionMastery
