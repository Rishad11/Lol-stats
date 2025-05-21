"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const LeaderboardsPage = () => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState("na")

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setLoading(true)
        // In a real app, this would be an actual API call
        const response = await fetch(`/api/leaderboards/${region}`)
        if (!response.ok) throw new Error("Failed to fetch leaderboards")

        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error("Error fetching leaderboards:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboards()

    // For development, use mock data
    const mockPlayers = Array(100)
      .fill(null)
      .map((_, i) => ({
        id: `player-${i}`,
        rank: i + 1,
        name: `Player${i + 1}`,
        tier: i < 10 ? "CHALLENGER" : i < 50 ? "GRANDMASTER" : "MASTER",
        leaguePoints: 1000 - i * 8 + Math.floor(Math.random() * 30),
        wins: 100 + Math.floor(Math.random() * 200),
        losses: 50 + Math.floor(Math.random() * 150),
      }))

    setPlayers(mockPlayers)
    setLoading(false)
  }, [region])

  const regions = [
    { value: "na", label: "North America" },
    { value: "euw", label: "Europe West" },
    { value: "eune", label: "Europe Nordic & East" },
    { value: "kr", label: "Korea" },
    { value: "jp", label: "Japan" },
  ]

  const calculateWinRate = (wins, losses) => {
    const total = wins + losses
    return total > 0 ? Math.round((wins / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboards</h1>

      <div className="mb-6">
        <label htmlFor="region-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Region
        </label>
        <select
          id="region-select"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {regions.map((region) => (
            <option key={region.value} value={region.value}>
              {region.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Summoner
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tier
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                LP
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Win Rate
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                W/L
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{player.rank}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/summoner/${region}/${player.name}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {player.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      player.tier === "CHALLENGER"
                        ? "bg-yellow-100 text-yellow-800"
                        : player.tier === "GRANDMASTER"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {player.tier}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{player.leaguePoints} LP</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{calculateWinRate(player.wins, player.losses)}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <span className="text-green-500">{player.wins}W</span>{" "}
                    <span className="text-red-500">{player.losses}L</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeaderboardsPage
