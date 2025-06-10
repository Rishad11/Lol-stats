"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Trophy, Award, Star, Target, TrendingUp } from "lucide-react"
import axios from "axios"
import { useDataDragon } from "../hooks/UseDataDragon"
import SummonerTabs from "../components/SummonerTabs"

const SummonerChampionMastery = () => {
  const { region, summonerName } = useParams()
  const [summoner, setSummoner] = useState(null)
  const [championMastery, setChampionMastery] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { getChampionImageUrl, loading: ddLoading } = useDataDragon()

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

        const masteryRes = await axios.get(`/api/summoner/${region}/${summonerData.puuid}/champion-mastery`)
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

  const getMasteryBadge = (level) => {
    const configs = {
      7: {
        gradient: "from-amber-400 via-yellow-500 to-amber-600",
        icon: Trophy,
        glow: "shadow-amber-500/25",
        textColor: "text-amber-700",
        bgColor: "bg-amber-50",
      },
      6: {
        gradient: "from-purple-400 via-violet-500 to-purple-600",
        icon: Award,
        glow: "shadow-purple-500/25",
        textColor: "text-purple-700",
        bgColor: "bg-purple-50",
      },
      5: {
        gradient: "from-blue-400 via-cyan-500 to-blue-600",
        icon: Star,
        glow: "shadow-blue-500/25",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
      },
      default: {
        gradient: "from-slate-400 via-gray-500 to-slate-600",
        icon: Target,
        glow: "shadow-gray-500/25",
        textColor: "text-slate-700",
        bgColor: "bg-slate-50",
      },
    }
    return configs[level] || configs.default
  }

  if (loading || ddLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Home
          </Link>
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <p className="text-slate-600 mt-6 text-lg">Loading champion mastery data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Home
          </Link>
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                <p className="mt-2 text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!summoner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Home
          </Link>
          <div className="text-center py-32">
            <h2 className="text-3xl font-bold text-slate-700">Summoner not found</h2>
            <p className="text-slate-500 mt-2">Please check the summoner name and region.</p>
          </div>
        </div>
      </div>
    )
  }

  const totalMasteryPoints = championMastery.reduce((sum, champ) => sum + champ.championPoints, 0)
  const totalChampions = championMastery.length
  const averageMasteryPoints = totalChampions > 0 ? Math.round(totalMasteryPoints / totalChampions) : 0
  const highestMasteryPoints =
    championMastery.length > 0 ? Math.max(...championMastery.map((c) => c.championPoints)) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Home
        </Link>

        {/* Tabs */}
        <SummonerTabs region={region} summonerName={summonerName} />

        {/* Simplified Mastery Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Mastery Statistics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 group-hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-blue-600 mb-2">{formatNumber(totalMasteryPoints)}</div>
                <div className="text-sm text-blue-700 font-medium">Total Mastery Points</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 group-hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-purple-600 mb-2">{totalChampions}</div>
                <div className="text-sm text-purple-700 font-medium">Champions Played</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 group-hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{formatNumber(averageMasteryPoints)}</div>
                <div className="text-sm text-emerald-700 font-medium">Average Points</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 group-hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-amber-600 mb-2">{formatNumber(highestMasteryPoints)}</div>
                <div className="text-sm text-amber-700 font-medium">Highest Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Champion Mastery Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Champion Mastery ({championMastery.length})</h2>
        </div>

        {/* Enhanced Champion Grid */}
        {championMastery.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="text-slate-400 mb-4">
              <Target className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Mastery Data</h3>
            <p className="text-slate-500">Start playing champions to build your mastery!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {championMastery.map((champ, index) => {
              const masteryConfig = getMasteryBadge(champ.championLevel)
              const IconComponent = masteryConfig.icon

              return (
                <div
                  key={champ.championId}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Champion Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg">
                        <img
                          src={getChampionImageUrl(champ.championName) || "/placeholder.svg"}
                          alt={champ.championName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{champ.championName}</h3>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${masteryConfig.gradient} shadow-lg ${masteryConfig.glow}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        Level {champ.championLevel}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-600">Mastery Points</span>
                      <span className="font-bold text-blue-600 text-lg">{formatNumber(champ.championPoints)}</span>
                    </div>

                    {/* Progress Bar for champions that can level up */}
                    {champ.championPointsUntilNextLevel > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Progress to Level {champ.championLevel + 1}</span>
                          <span>
                            {formatNumber(champ.championPointsSinceLastLevel)} /{" "}
                            {formatNumber(champ.championPointsSinceLastLevel + champ.championPointsUntilNextLevel)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{
                              width: `${(champ.championPointsSinceLastLevel / (champ.championPointsSinceLastLevel + champ.championPointsUntilNextLevel)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Max level indicator */}
                    {champ.championPointsUntilNextLevel === 0 && (
                      <div className="text-center p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                        <div className="flex items-center justify-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">Maximum Level Reached</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SummonerChampionMastery
