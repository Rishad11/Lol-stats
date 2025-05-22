"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"

const ChampionsPage = () => {
  const [champions, setChampions] = useState([])
  const [filteredChampions, setFilteredChampions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get("/api/champions")
        setChampions(response.data)
        setFilteredChampions(response.data)
      } catch (error) {
        console.error("Error fetching champions:", error)
        setError("Failed to load champions. Please try again later.")
        // Initialize with empty array on error
        setChampions([])
        setFilteredChampions([])
      } finally {
        setLoading(false)
      }
    }

    fetchChampions()
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Champions</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Champions</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
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
                          src={champion.image || `/placeholder.svg?height=40&width=40&text=${champion.name.charAt(0)}`}
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
                        {champion.title && <p className="text-xs text-gray-500">{champion.title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {champion.roles && champion.roles.length > 0 ? (
                        champion.roles.map((role) => (
                          <span key={role} className="px-2 py-1 text-xs rounded-full bg-gray-100">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
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
                  {searchQuery || roleFilter !== "all"
                    ? "No champions found. Try adjusting your filters."
                    : "No champions available."}
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
