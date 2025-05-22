"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"

const ChampionsPage = () => {
  const [champions, setChampions] = useState([])
  const [filteredChampions, setFilteredChampions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        // In a real app, this would be an actual API call
        const response = await fetch("/api/champions")
        if (!response.ok) throw new Error("Failed to fetch champions")

        const data = await response.json()
        setChampions(data)
        setFilteredChampions(data)
      } catch (error) {
        console.error("Error fetching champions:", error)
        // Initialize with empty array on error
        setChampions([])
        setFilteredChampions([])
      } finally {
        setLoading(false)
      }
    }

    // For development, use mock data
    const mockChampions = [
      { id: "Ahri", name: "Ahri", roles: ["MID"], winRate: 51.2, pickRate: 8.5, banRate: 3.2 },
      { id: "Ashe", name: "Ashe", roles: ["ADC"], winRate: 49.8, pickRate: 7.2, banRate: 1.5 },
      { id: "Darius", name: "Darius", roles: ["TOP"], winRate: 50.3, pickRate: 6.8, banRate: 8.7 },
      { id: "Ekko", name: "Ekko", roles: ["MID", "JUNGLE"], winRate: 50.9, pickRate: 5.4, banRate: 2.8 },
      { id: "Janna", name: "Janna", roles: ["SUPPORT"], winRate: 52.1, pickRate: 4.3, banRate: 0.9 },
      { id: "Jinx", name: "Jinx", roles: ["ADC"], winRate: 50.5, pickRate: 9.1, banRate: 2.3 },
      { id: "Lee Sin", name: "Lee Sin", roles: ["JUNGLE"], winRate: 48.7, pickRate: 10.2, banRate: 5.6 },
      { id: "Lux", name: "Lux", roles: ["MID", "SUPPORT"], winRate: 50.1, pickRate: 11.5, banRate: 3.4 },
      { id: "Malphite", name: "Malphite", roles: ["TOP"], winRate: 51.8, pickRate: 3.9, banRate: 2.1 },
      { id: "Thresh", name: "Thresh", roles: ["SUPPORT"], winRate: 49.5, pickRate: 8.7, banRate: 2.8 },
      { id: "Yasuo", name: "Yasuo", roles: ["MID", "TOP"], winRate: 48.9, pickRate: 12.3, banRate: 14.5 },
      { id: "Zed", name: "Zed", roles: ["MID"], winRate: 49.2, pickRate: 9.8, banRate: 13.2 },
    ]

    setChampions(mockChampions)
    setFilteredChampions(mockChampions)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Make sure champions is defined before filtering
    if (!champions || champions.length === 0) {
      setFilteredChampions([])
      return
    }

    let filtered = [...champions]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((champion) => champion.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((champion) => champion.roles && champion.roles.includes(roleFilter))
    }

    setFilteredChampions(filtered)
  }, [searchQuery, roleFilter, champions])

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "TOP", label: "Top" },
    { value: "JUNGLE", label: "Jungle" },
    { value: "MID", label: "Mid" },
    { value: "ADC", label: "ADC" },
    { value: "SUPPORT", label: "Support" },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Champions</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search champions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
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
                Champion
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
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
                Pick Rate
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ban Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredChampions && filteredChampions.length > 0 ? (
              filteredChampions.map((champion) => (
                <tr key={champion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={`/placeholder.svg?height=40&width=40&text=${champion.name.charAt(0)}`}
                          alt={champion.name}
                          className="h-10 w-10 object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/champions/${champion.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {champion.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {champion.roles &&
                        champion.roles.map((role) => (
                          <span key={role} className="px-2 py-1 text-xs rounded-full bg-gray-100">
                            {role}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{champion.winRate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{champion.pickRate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{champion.banRate}%</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No champions found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ChampionsPage
