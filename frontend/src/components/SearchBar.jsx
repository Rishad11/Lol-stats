"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const SearchBar = ({ type = "summoner", placeholder = "Search..." }) => {
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
  }, [query, region, type])

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
      let response

      if (type === "champion") {
        response = await axios.get(`/api/search/champions`, {
          params: { query },
        })
      } else {
        // Summoner search
        response = await axios.get(`/api/search/summoners/${region}`, {
          params: { query },
        })
      }

      setResults(response.data)
      setShowResults(true)
    } catch (error) {
      console.error(`Error searching ${type}s:`, error)
      if (error.response?.status === 403) {
        setError("API key invalid or expired. Please check your API key.")
      } else {
        setError(`Failed to search ${type}s`)
      }
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return

    if (type === "champion") {
      navigate(`/champions?search=${encodeURIComponent(query)}`)
    } else {
      // For summoner searches, we'll pass the query as-is (could be a name or Riot ID)
      navigate(`/summoner/${region}/${encodeURIComponent(query)}`)
    }

    setShowResults(false)
  }

  const handleResultClick = (item) => {
    if (type === "champion") {
      navigate(`/champions/${item.id}`)
    } else {
      // For summoners, use the gameName and tagLine if available
      if (item.gameName && item.tagLine) {
        navigate(`/summoner/${region}/${encodeURIComponent(`${item.gameName}#${item.tagLine}`)}`)
      } else {
        navigate(`/summoner/${region}/${encodeURIComponent(item.name)}`)
      }
    }
    setShowResults(false)
    setQuery("")
  }

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex">
        {type === "summoner" && (
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
        )}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={type === "summoner" ? "Summoner name or Riot ID (name#tag)" : placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            className={`w-full border-0 py-1.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 ${
              type === "summoner" ? "" : "rounded-l-md"
            }`}
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
                    alt={item.name}
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = `/placeholder.svg?height=32&width=32&text=${item.name.charAt(0)}`
                    }}
                  />
                )}
                <div>
                  <div className="font-medium">
                    {item.gameName && item.tagLine ? `${item.gameName}#${item.tagLine}` : item.name}
                  </div>
                  {item.title && <div className="text-xs text-gray-500">{item.title}</div>}
                  {item.summonerLevel && <div className="text-xs text-gray-500">Level {item.summonerLevel}</div>}
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

export default SearchBar
