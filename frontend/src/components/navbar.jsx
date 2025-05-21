"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Menu, X } from "lucide-react"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("na")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/summoner/${region}/${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const regions = [
    { value: "na", label: "NA" },
    { value: "euw", label: "EUW" },
    { value: "eune", label: "EUNE" },
    { value: "kr", label: "KR" },
    { value: "jp", label: "JP" },
  ]

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/placeholder.svg" alt="LoL Stats" />
              <span className="ml-2 text-xl font-bold">LoL Stats</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded-md">
                Home
              </Link>
              <Link to="/champions" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded-md">
                Champions
              </Link>
              <Link to="/leaderboards" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded-md">
                Leaderboards
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <form onSubmit={handleSearch} className="flex">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-l-md border-0 py-1.5 text-gray-900 bg-white"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search summoner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 border-0 py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0"
              />
              <button type="submit" className="bg-blue-800 p-1.5 rounded-r-md hover:bg-blue-900">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-base font-medium hover:bg-blue-700">
              Home
            </Link>
            <Link to="/champions" className="block px-3 py-2 text-base font-medium hover:bg-blue-700">
              Champions
            </Link>
            <Link to="/leaderboards" className="block px-3 py-2 text-base font-medium hover:bg-blue-700">
              Leaderboards
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <form onSubmit={handleSearch} className="flex px-3">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-l-md border-0 py-1.5 text-gray-900 bg-white"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search summoner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0"
              />
              <button type="submit" className="bg-blue-800 p-1.5 rounded-r-md hover:bg-blue-900">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
