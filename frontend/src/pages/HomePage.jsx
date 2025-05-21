"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("na")
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/summoner/${region}/${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const regions = [
    { value: "na", label: "NA" },
    { value: "euw", label: "EUW" },
    { value: "eune", label: "EUNE" },
    { value: "kr", label: "KR" },
    { value: "jp", label: "JP" },
  ]

  const popularChampions = [
    { id: "Yasuo", name: "Yasuo" },
    { id: "Jinx", name: "Jinx" },
    { id: "Lux", name: "Lux" },
    { id: "Zed", name: "Zed" },
    { id: "Ahri", name: "Ahri" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/placeholder.svg" alt="LoL Stats Logo" className="h-24 w-auto" />
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">LoL Stats Tracker</h1>
          <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl">
            Search for summoners, view match history, and track your performance in League of Legends.
          </p>

          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex shadow-lg rounded-lg overflow-hidden">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-4 py-3 bg-white text-gray-800 font-medium border-0"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search summoner name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-800 focus:outline-none border-0"
              />
              <button
                type="submit"
                className="bg-blue-900 px-6 py-3 text-white font-medium hover:bg-blue-800 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Popular Champions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
              {popularChampions.map((champion) => (
                <a
                  key={champion.id}
                  href={`/champions/${champion.id}`}
                  className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all"
                >
                  <div className="aspect-square rounded-full bg-gray-200 mb-2 overflow-hidden">
                    <img
                      src={`/placeholder.svg?height=80&width=80&text=${champion.name}`}
                      alt={champion.name}
                      className="w-full h-full object-cover"
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
