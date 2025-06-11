"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useLeaderboards } from "../hooks/useLeaderboards"
import { getRegionOptions, getPlatformCode } from "../utils/regionHelpers"
import { calculateWinRate } from "../utils/gameHelpers"

const LeaderboardsPage = () => {
  const [region, setRegion] = useState("na")
  const { players, loading, error } = useLeaderboards(region, 10)

  const platformCode = getPlatformCode(region)
  const regions = getRegionOptions()

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
                  {/* Navigate by PUUID for search consistency using the derived platform code */}
                  <Link
                    to={`/summoner/${platformCode}/${encodeURIComponent(player.name)}`}
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
