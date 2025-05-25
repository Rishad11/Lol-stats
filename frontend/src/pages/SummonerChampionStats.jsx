"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import axios from "axios"
import SummonerTabs from "../components/summonertabs"

const SummonerChampionStats = () => {
  const { region, summonerName } = useParams()
  const [summoner, setSummoner] = useState(null)
  const [championStats, setChampionStats] = useState([])
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

        const statsRes = await axios.get(`/api/summoner/${region}/${summonerData.puuid}/champion-wins`)
        setChampionStats(statsRes.data || [])
      } catch (err) {
        console.error("Error fetching champion stats:", err)
        const errorMessage = err.response?.data?.error || err.message

        if (err.response?.status === 404) {
          setError(`Summoner "${summonerName}" not found in ${region.toUpperCase()} region.`)
        } else if (err.response?.status === 403) {
          setError(`API key invalid or expired. Please check your API key.`)
        } else {
          setError(`Failed to load champion stats: ${errorMessage}`)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [region, summonerName])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Loading champion stats...</p>
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

      {/* Champion Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Champion Win Rates (Ranked)</h2>

        {championStats.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No ranked data found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {championStats
              .sort((a, b) => b.games - a.games)
              .map((champ) => (
                <div key={champ.champion} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champ.champion}.png`}
                        alt={champ.champion}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = `/placeholder.svg?height=48&width=48&text=${champ.champion.charAt(0)}`
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold">{champ.champion}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-blue-500 rounded-full"></div>
                      <span>
                        <strong>Games:</strong> {champ.games}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-green-500 rounded-full"></div>
                      <span>
                        <strong>Wins:</strong> {champ.wins}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-red-500 rounded-full"></div>
                      <span>
                        <strong>Losses:</strong> {champ.games - champ.wins}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-yellow-500 rounded-full"></div>
                      <span>
                        <strong>Win Rate:</strong> {((champ.wins / champ.games) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Win Rate Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Win Rate</span>
                      <span>{((champ.wins / champ.games) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (champ.wins / champ.games) * 100 >= 60
                            ? "bg-green-500"
                            : (champ.wins / champ.games) * 100 >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${(champ.wins / champ.games) * 100}%` }}
                      ></div>
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

export default SummonerChampionStats
