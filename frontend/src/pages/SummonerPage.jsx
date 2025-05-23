"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ArrowLeft, Shield, Sword, Award, Users } from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"

const SummonerPage = () => {
  const { region, summonerName } = useParams()
  const [summoner, setSummoner] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchSummonerData = async () => {
      try {
        setLoading(true)
        setError(null)

        let summonerData

        if (summonerName.includes("#")) {
          const [gameName, tagLine] = summonerName.split("#")
          const accountResponse = await axios.get(
            `/api/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
          )
          const { puuid } = accountResponse.data
          const summonerResponse = await axios.get(`/api/summoner/by-puuid/${region}/${puuid}`)
          summonerData = summonerResponse.data
        } else {
          const summonerResponse = await axios.get(`/api/summoner/${region}/${encodeURIComponent(summonerName)}`)
          summonerData = summonerResponse.data
        }

        // Fetch rank data
        const rankResponse = await axios.get(`/api/summoner/${region}/${summonerData.id}/rank`)
        summonerData.rank = rankResponse.data?.[0] || null

        if (summonerData.rank) {
          summonerData.totalGames = summonerData.rank.wins + summonerData.rank.losses
          summonerData.winRate = Math.round((summonerData.rank.wins / summonerData.totalGames) * 100)
        }

        setSummoner(summonerData)

        try {
          const matchesResponse = await axios.get(`/api/summoner/${region}/${summonerData.puuid}/matches`)
          setMatches(matchesResponse.data)
        } catch (matchError) {
          console.error("Error fetching matches:", matchError)
          setMatches([])
        }
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
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    fetchSummonerData()
  }, [region, summonerName])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Loading summoner data...</p>
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
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">Try checking for:</p>
          <ul className="list-disc list-inside text-left max-w-md mx-auto text-gray-600">
            <li>Correct spelling of the summoner name</li>
            <li>Proper region selection</li>
            <li>If the account exists or has been renamed</li>
            <li>If your API key is valid and has not expired</li>
          </ul>
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

  // Calculate stats from match history
  const totalGames = matches.length
  const wins = matches.filter((match) => match.win).length
  const losses = totalGames - wins
  const winRateFromMatches = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

  const kdaSum = matches.reduce((sum, match) => {
    const kda = (match.kills + match.assists) / Math.max(1, match.deaths)
    return sum + kda
  }, 0)
  const avgKDA = totalGames > 0 ? (kdaSum / totalGames).toFixed(2) : "0.00"

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
                src={`https://ddragon.leagueoflegends.com/cdn/13.10.1/img/profileicon/${summoner.profileIconId}.png`}
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
                <div className="font-bold">
                  {typeof summoner.winRate !== "undefined" ? summoner.winRate : winRateFromMatches}%
                </div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <div className="text-sm text-gray-500">W/L</div>
                <div className="font-bold text-green-500">
                  {summoner.rank ? summoner.rank.wins : wins}W{" "}
                  <span className="text-red-500">
                    {summoner.rank ? summoner.rank.losses : losses}L
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("champions")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === "champions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Champions
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === "live"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Live Game
          </button>
        </nav>
      </div>

      {/* Match History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Match History</h2>

        {matches.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No recent matches found for this summoner.</p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                match.win ? "border-blue-500" : "border-red-500"
              }`}
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/13.10.1/img/champion/${match.champion}.png`}
                        alt={match.champion}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = `/placeholder.svg?height=64&width=64&text=${match.champion.charAt(0)}`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <h3 className="font-bold">{match.champion}</h3>
                        <p className={`text-sm ${match.win ? "text-blue-500" : "text-red-500"}`}>
                          {match.win ? "Victory" : "Defeat"} • {match.role}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(match.gameCreation).toLocaleDateString()} •{Math.floor(match.gameDuration / 60)}:
                          {(match.gameDuration % 60).toString().padStart(2, "0")}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-lg font-bold">
                          {match.kills} / <span className="text-red-500">{match.deaths}</span> / {match.assists}
                        </div>
                        <div className="text-sm text-gray-500">
                          {((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2)} KDA
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="flex items-center">
                        <Sword className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          CS: {match.cs} ({(match.cs / (match.gameDuration / 60)).toFixed(1)})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Vision: {match.visionScore || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{match.multikill || "No"} Multikill</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{match.gameMode || "5v5"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SummonerPage