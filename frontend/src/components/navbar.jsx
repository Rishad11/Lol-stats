"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import UnifiedSearchBar from "./UnifiedSearchBar"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
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
            <div className="w-80">
              <UnifiedSearchBar placeholder="Search champions or Riot ID..." />
            </div>
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
            <div className="px-3">
              <UnifiedSearchBar placeholder="Search champions or Riot ID..." />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
