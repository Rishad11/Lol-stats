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

  // Custom render function for search results
  const renderCustomResultItem = (item) => {
    if (item.type === "summoner") {
      return (
        <div className="flex items-center w-full">
          {item.profileIconUrl && (
            <img
              src={item.profileIconUrl || "/placeholder.svg"}
              alt={`${item.gameName} profile`}
              className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `/placeholder.svg?height=40&width=40&text=${item.gameName?.charAt(0) || "?"}`
              }}
            />
          )}
          <div className="flex flex-col">
            <div className="font-semibold text-black">
              {item.gameName || "Unknown"}#{item.tagLine || "???"}
            </div>
            <div className="text-sm text-gray-600">Level {item.summonerLevel || "?"}</div>
          </div>
        </div>
      )
    }

    // Default rendering for champions
    return (
      <>
        {item.image && (
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="w-8 h-8 rounded-full mr-3 object-cover"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = `/placeholder.svg?height=32&width=32&text=${item.name?.charAt(0) || "?"}`
            }}
          />
        )}
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.title && <div className="text-xs text-gray-500">{item.title}</div>}
        </div>
      </>
    )
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-l-md border-0 py-1.5 text-gray-900 bg-white font-medium"
        >
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.shortName || region.name}
            </option>
          ))}
        </select>
        <div className="flex-1">
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
            hideForm
            renderCustomResultItem={renderCustomResultItem}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-800 p-1.5 rounded-r-md hover:bg-blue-900 text-white"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default UnifiedSearchBar
