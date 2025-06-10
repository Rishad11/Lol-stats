"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { useDataDragon } from "../hooks/UseDataDragon"
import { useChampions } from "../hooks/useChampions"
import SearchBar from "../components/SearchBar"

const ChampionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const location = useLocation()

  const { version, getChampionImageUrl, loading: ddLoading } = useDataDragon()
  const { champions, loading, error } = useChampions(version)

  useEffect(() => {
    // Extract search query from URL if present
    const params = new URLSearchParams(location.search)
    const searchParam = params.get("search")
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [location.search])

  // Memoize filteredChampions to avoid infinite re-renders
  const filteredChampions = useMemo(() => {
    if (!champions || champions.length === 0) {
      return []
    }
    let filtered = [...champions]
    if (searchQuery) {
      filtered = filtered.filter((champion) => champion.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (tagFilter !== "all") {
      filtered = filtered.filter((champion) => champion.tags && champion.tags.includes(tagFilter))
    }
    // Add image URLs to champions
    return filtered.map((champion) => ({
      ...champion,
      image: getChampionImageUrl(champion.id),
    }))
  }, [searchQuery, tagFilter, champions, getChampionImageUrl])

  // Get unique tags from all champions for filter dropdown
  const availableTags = champions.length > 0 ? [...new Set(champions.flatMap((champion) => champion.tags || []))] : []
  const tagOptions = [{ value: "all", label: "All Types" }, ...availableTags.map((tag) => ({ value: tag, label: tag }))]

  if (loading || ddLoading) {
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
          <SearchBar type="champion" placeholder="Search champions..." />
        </div>

        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {tagOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Champions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredChampions && filteredChampions.length > 0 ? (
          filteredChampions.map((champion) => (
            <Link
              key={champion.id}
              to={`/champions/${champion.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 mb-3 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                <img
                  src={champion.image || "/placeholder.svg"}
                  alt={champion.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {champion.name}
              </h3>
              {champion.title && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{champion.title}</p>}
              {champion.tags && champion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {champion.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-500">
              {searchQuery || tagFilter !== "all"
                ? "No champions found. Try adjusting your filters."
                : "No champions available."}
            </p>
          </div>
        )}
      </div>

      {filteredChampions.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredChampions.length} of {champions.length} champions
        </div>
      )}
    </div>
  )
}

export default ChampionsPage
