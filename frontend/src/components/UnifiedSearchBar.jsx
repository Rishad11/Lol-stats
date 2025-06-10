"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import SearchBar from "./SearchBar"

const UnifiedSearchBar = ({ placeholder = "Search champions or Riot ID (name#tag)..." }) => {
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("na1")
  const [regions, setRegions] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get("/api/regions")
        setRegions(response.data)
        if (response.data.length > 0) {
          setRegion(response.data[0].code)
        }
      } catch (error) {
        setError("Failed to load regions")
      }
    }
    fetchRegions()
  }, [])

  // Unified search logic: champion or Riot ID
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }
    const timer = setTimeout(() => {
      searchItems()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line
  }, [query, region])

  const searchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const isRiotIdSearch = query.includes("#")
      if (isRiotIdSearch) {
        const [gameName, tagLine] = query.split("#")
        if (gameName.length < 3 || !tagLine || tagLine.length < 2) {
          setResults([])
          setLoading(false)
          return
        }
        const response = await axios.get(`/api/search/summoners/${region}`, { params: { query } })
        const summoners = response.data.map((item) => ({
          ...item,
          type: "summoner",
        }))
        setResults(summoners)
      } else {
        // Delegate champion search to SearchBar logic
        const response = await axios.get(`/api/search/champions`, { params: { query } })
        const champions = response.data.map((item) => ({
          ...item,
          type: "champion",
        }))
        setResults(champions)
      }
      setShowResults(true)
    } catch (error) {
      if (error.response?.status === 403) {
        setError("API key invalid or expired. Please check your API key.")
      } else if (error.response?.status === 404) {
        setResults([])
        setShowResults(true)
      } else {
        setError("Search failed. Please try again.")
      }
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    if (query.includes("#")) {
      navigate(`/summoner/${region}/${encodeURIComponent(query)}`)
    } else {
      navigate(`/champions?search=${encodeURIComponent(query)}`)
    }
    setShowResults(false)
  }

  const handleResultClick = (item) => {
    if (item.type === "champion") {
      navigate(`/champions/${item.id}`)
    } else if (item.gameName && item.tagLine) {
      navigate(`/summoner/${region}/${encodeURIComponent(`${item.gameName}#${item.tagLine}`)}`)
    }
    setShowResults(false)
    setQuery("")
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-l-md border-0 py-1.5 text-gray-900 bg-white"
        >
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {/* Show region.shortName or region.name for display, but value must be region.code */}
              {region.shortName || region.name}
            </option>
          ))}
        </select>
        <div className="flex-1">
          {/* Reuse SearchBar input and dropdown UI, but control via UnifiedSearchBar state */}
          <SearchBar
            placeholder={placeholder}
            query={query}
            setQuery={setQuery}
            results={results}
            setResults={setResults}
            loading={loading}
            setLoading={setLoading}
            showResults={showResults}
            setShowResults={setShowResults}
            error={error}
            setError={setError}
            onResultClick={handleResultClick}
            inputClassName="w-full border-0 py-1.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0"
            hideForm // Hide SearchBar's own form, since UnifiedSearchBar wraps it
          />
        </div>
        <button
          type="submit"
          className="bg-blue-800 p-1.5 rounded-r-md hover:bg-blue-900 text-white"
          aria-label="Search"
        >
          {/* ...existing code... */}
        </button>
      </form>
    </div>
  )
}

export default UnifiedSearchBar
