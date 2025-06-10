"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const SearchBar = ({
  placeholder = "Search champions...",
  query: controlledQuery,
  setQuery: setControlledQuery,
  results: controlledResults,
  setResults: setControlledResults,
  loading: controlledLoading,
  setLoading: setControlledLoading,
  showResults: controlledShowResults,
  setShowResults: setControlledShowResults,
  error: controlledError,
  setError: setControlledError,
  onResultClick,
  inputClassName = "w-full border-0 py-1.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 rounded-l-md",
  hideForm = false,
  renderCustomResultItem,
}) => {
  // Use controlled state if provided, otherwise fallback to internal state
  const [query, setQuery] = controlledQuery !== undefined ? [controlledQuery, setControlledQuery] : useState("")
  const [results, setResults] = controlledResults !== undefined ? [controlledResults, setControlledResults] : useState([])
  const [loading, setLoading] = controlledLoading !== undefined ? [controlledLoading, setControlledLoading] : useState(false)
  const [showResults, setShowResults] = controlledShowResults !== undefined ? [controlledShowResults, setControlledShowResults] : useState(false)
  const [error, setError] = controlledError !== undefined ? [controlledError, setControlledError] : useState(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Debounced search (only if not controlled externally)
  useEffect(() => {
    if (
      controlledQuery !== undefined ||
      controlledResults !== undefined ||
      controlledLoading !== undefined ||
      controlledShowResults !== undefined ||
      controlledError !== undefined
    ) {
      return
    }
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      searchItems()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line
  }, [query])

  // Click outside to close
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
      const response = await axios.get(`/api/search/champions`, { params: { query } })
      setResults(response.data)
      setShowResults(true)
    } catch (error) {
      setError("Failed to search champions")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/champions?search=${encodeURIComponent(query)}`)
    setShowResults(false)
  }

  const handleResultClick = (item) => {
    if (onResultClick) {
      onResultClick(item)
    } else {
      navigate(`/champions/${item.id}`)
      setShowResults(false)
      setQuery("")
    }
  }

  const inputProps = {
    type: "text",
    placeholder,
    value: query,
    onChange: (e) => setQuery(e.target.value),
    onFocus: () => query.length >= 2 && setShowResults(true),
    className: inputClassName,
  }

  const renderInput = (
    <div className="relative flex-1">
      <input {...inputProps} />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  )

  if (hideForm) {
    // Only render input and dropdown, not the form
    return (
      <div className="relative" ref={searchRef}>
        {renderInput}
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
                  {renderCustomResultItem
                    ? renderCustomResultItem(item)
                    : (
                      <>
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
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.title && <div className="text-xs text-gray-500">{item.title}</div>}
                        </div>
                      </>
                    )
                  }
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

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex">
        {renderInput}
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
                {renderCustomResultItem
                  ? renderCustomResultItem(item)
                  : (
                    <>
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
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.title && <div className="text-xs text-gray-500">{item.title}</div>}
                      </div>
                    </>
                  )
                }
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