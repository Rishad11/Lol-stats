"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ArrowLeft, Shield, Sword, Award, Users } from "lucide-react"
import { Link } from "react-router-dom"

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
        // In a real app, these would be actual API calls to your backend
        const summonerResponse = await fetch(`/api/summoner/${region}/${summonerName}`)
        if (!summonerResponse.ok) throw new Error("Summoner not found")

        const summonerData = await summonerResponse.json()
        setSummoner(summonerData)

        const matchesResponse = await fetch(`/api/matches/${region}/${summonerData.puuid}`)
        if (!matchesResponse.ok) throw new Error("Could not fetch matches")

        const matchesData = await matchesResponse.json()
        setMatches(matchesData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSummonerData()
  }, [region, summonerName])

  // Mock data for development
  useEffect(() => {
    // This simulates API responses during development
    const mockSummoner = {
      name: summonerName,
      profileIconId: 1,
      summonerLevel: 150,
      rank: {
        tier: "PLATINUM",
        rank: "II",
        leaguePoints: 45,
        wins: 120,
        losses: 100,
      },
      puuid: "mock-puuid",
    }

    const mockMatches = Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `match-${i}`,
        champion: ["Yasuo", "Jinx", "Lux", "Zed", "Ahri"][Math.floor(Math.random() * 5)],
        win: Math.random() > 0.5,
        kills: Math.floor(Math.random() * 15),
        deaths: Math.floor(Math.random() * 10),
        assists: Math.floor(Math.random() * 20),
        gameMode: "CLASSIC",
        gameDuration: 1800 + Math.floor(Math.random() * 1200),
        gameCreation: Date.now() - i * 86400000 - Math.floor(Math.random() * 86400000),
        role: ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"][Math.floor(Math.random() * 5)],
        cs: 150 + Math.floor(Math.random() * 100),
      }))

    setSummoner(mockSummoner)
    setMatches(mockMatches)
    setLoading(false)
  }, [summonerName])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <p className="mt-4">Please check the summoner name and region and try again.</p>
        <Link to="/" className="mt-6 inline-flex items-center text-blue-500 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
    )
  }

  // Calculate stats
  const totalGames = matches.length
  const wins = matches.filter((match) => match.win).length
  const losses = totalGames - wins
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

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
                src={`/placeholder.svg?height=96&width=96&text=${summoner.name.charAt(0)}`}
                alt={summoner.name}
                className="w-full h-full object-cover"
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
                  {summoner.rank.tier} {summoner.rank.rank}
                </div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <div className="text-sm text-gray-500">LP</div>
                <div className="font-bold">{summoner.rank.leaguePoints}</div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <div className="text-sm text-gray-500">Win Rate</div>
                <div className="font-bold">{winRate}%</div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-md">
                <div className="text-sm text-gray-500">W/L</div>
                <div className="font-bold text-green-500">
                  {wins}W <span className="text-red-500">{losses}L</span>
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

        {matches.map((match) => (
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
                      src={`/placeholder.svg?height=64&width=64&text=${match.champion.charAt(0)}`}
                      alt={match.champion}
                      className="w-full h-full object-cover"
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
                      <span className="text-sm">Vision: 23</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">Triple Kill</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">5v5 Ranked Solo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SummonerPage
