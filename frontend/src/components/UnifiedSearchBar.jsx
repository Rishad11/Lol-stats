"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const UnifiedSearchBar = ({ placeholder = "Search champions or Riot ID (name#tag)..." }) => {
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("na1")
  const [regions, setRegions] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get("/api/regions")
        setRegions(response.data)
        // Set default region to the first one
        if (response.data.length > 0) {
          setRegion(response.data[0].code)
        }
      } catch (error) {
        console.error("Error fetching regions:", error)
        setError("Failed to load regions")
      }
    }

    fetchRegions()
  }, [])

  // Handle search query changes with debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      searchItems()
    }, 300)

    return () => clearTimeout(timer)
  }, [query, region])

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const searchItems = async () => {
    setLoading(true)
    setError(null)

    try {
      // Determine if this is a Riot ID search or champion search
      const isRiotIdSearch = query.includes("#")

      if (isRiotIdSearch) {
        // Only search if we have a complete Riot ID format
        const [gameName, tagLine] = query.split("#")
        if (gameName.length < 3 || !tagLine || tagLine.length < 2) {
          // Don't search with incomplete Riot ID
          setResults([])
          setLoading(false)
          return
        }

        const response = await axios.get(`/api/search/summoners/${region}`, {
          params: { query },
        })

        // Mark results as summoner type
        const summoners = response.data.map((item) => ({
          ...item,
          type: "summoner",
        }))

        setResults(summoners)
      } else {
        // Search for champions
        const response = await axios.get(`/api/search/champions`, {
          params: { query },
        })

        // Mark results as champion type
        const champions = response.data.map((item) => ({
          ...item,
          type: "champion",
        }))

        setResults(champions)
      }

      setShowResults(true)
    } catch (error) {
      console.error(`Error searching:`, error)
      if (error.response?.status === 403) {
        setError("API key invalid or expired. Please check your API key.")
      } else if (error.response?.status === 404) {
        // Don't show error for not found, just show no results
        setResults([])
        setShowResults(true)
      } else {
        setError(`Search failed. Please try again.`)
      }
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return

    // Determine if this is a Riot ID search or champion search
    if (query.includes("#")) {
      // Riot ID search
      navigate(`/summoner/${region}/${encodeURIComponent(query)}`)
    } else {
      // Champion search
      navigate(`/champions?search=${encodeURIComponent(query)}`)
    }

    setShowResults(false)
  }

  const handleResultClick = (item) => {
    if (item.type === "champion") {
      navigate(`/champions/${item.id}`)
    } else {
      // For summoners, use the gameName and tagLine
      if (item.gameName && item.tagLine) {
        navigate(`/summoner/${region}/${encodeURIComponent(`${item.gameName}#${item.tagLine}`)}`)
      }
    }
    setShowResults(false)
    setQuery("")
  }

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-l-md border-0 py-1.5 text-gray-900 bg-white"
        >
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.shortName}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            className="w-full border-0 py-1.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-800 p-1.5 rounded-r-md hover:bg-blue-900 text-white"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {results.map((item) => (
              <li
                key={item.id}
                onClick={() => handleResultClick(item)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              >
                {item.image && (
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name || item.gameName}
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = `/placeholder.svg?height=32&width=32&text=${(item.name || item.gameName || "?").charAt(0)}`
                    }}
                  />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {item.type === "champion"
                      ? item.name
                      : item.gameName && item.tagLine
                        ? `${item.gameName}#${item.tagLine}`
                        : ""}
                  </div>
                  {item.type === "champion" && item.title && <div className="text-xs text-gray-500">{item.title}</div>}
                  {item.type === "summoner" && item.summonerLevel && (
                    <div className="text-xs text-gray-500">Level {item.summonerLevel}</div>
                  )}
                  <div className="text-xs text-blue-600">{item.type === "champion" ? "Champion" : "Player"}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results Message */}
      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg p-4 text-center text-gray-500">
          No results found
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute z-10 mt-1 w-full bg-red-50 border border-red-200 rounded-md shadow-lg p-4 text-center text-red-500">
          {error}
        </div>
      )}
    </div>
  )
}

export default UnifiedSearchBar
