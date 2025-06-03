"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import UnifiedSearchBar from "../components/UnifiedSearchBar"

const HomePage = () => {
  const [popularChampions, setPopularChampions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch popular champions
        const championsResponse = await axios.get("/api/champions")
        // Sort by pick rate and take top 5
        const sortedChampions = [...championsResponse.data]
          .sort((a, b) => Number.parseFloat(b.pickRate) - Number.parseFloat(a.pickRate))
          .slice(0, 5)

        setPopularChampions(sortedChampions)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")

        // Set fallback data
        setPopularChampions([
          { id: "Yasuo", name: "Yasuo", image: "/placeholder.svg?height=80&width=80&text=Y" },
          { id: "Jinx", name: "Jinx", image: "/placeholder.svg?height=80&width=80&text=J" },
          { id: "Lux", name: "Lux", image: "/placeholder.svg?height=80&width=80&text=L" },
          { id: "Zed", name: "Zed", image: "/placeholder.svg?height=80&width=80&text=Z" },
          { id: "Ahri", name: "Ahri", image: "/placeholder.svg?height=80&width=80&text=A" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/placeholder.svg" alt="LoL Stats Logo" className="h-24 w-auto" />
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">LoL Stats Tracker</h1>
          <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl">
            Search for champions or players using Riot ID (name#tag).
          </p>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mt-10 max-w-xl mx-auto">
            <UnifiedSearchBar placeholder="Search champions or Riot ID (name#tag)..." />
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Popular Champions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
              {loading
                ? // Loading skeleton
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4 animate-pulse">
                        <div className="aspect-square rounded-full bg-gray-300 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                      </div>
                    ))
                : popularChampions.map((champion) => (
                    <a
                      key={champion.id}
                      href={`/champions/${champion.id}`}
                      className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all"
                    >
                      <div className="aspect-square rounded-full bg-gray-200 mb-2 overflow-hidden">
                        <img
                          src={champion.image || `/placeholder.svg?height=80&width=80&text=${champion.name.charAt(0)}`}
                          alt={champion.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = `/placeholder.svg?height=80&width=80&text=${champion.name.charAt(0)}`
                          }}
                        />
                      </div>
                      <p className="text-white font-medium text-center">{champion.name}</p>
                    </a>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
