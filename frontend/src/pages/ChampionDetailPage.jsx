"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Shield, Sword, Heart, Zap } from "lucide-react"
import { fetchChampion } from "../services/apiCalls"
import { useDataDragon } from "../hooks/UseDataDragon"

const ChampionDetailPage = () => {
  const { championId } = useParams()
  const [champion, setChampion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  const {
    version,
    getChampionImageUrl,
    getChampionSplashUrl,
    getSpellImageUrl,
    getPassiveImageUrl,
    loading: ddLoading,
  } = useDataDragon()

  useEffect(() => {
    const fetchChampionDetails = async () => {
      if (!version) return // Wait for version to be loaded

      try {
        setLoading(true)
        setError(null)

        const response = await fetchChampion(championId, version)
        const championData = response.data[championId]

        if (championData) {
          // Transform the data to match your existing structure
          const transformedChampion = {
            ...championData,
            image: getChampionImageUrl(championId),
            splash: getChampionSplashUrl(championId),
            spells: championData.spells?.map((spell) => ({
              ...spell,
              image: getSpellImageUrl(spell.image?.full?.replace(".png", "")),
            })),
            passive: championData.passive
              ? {
                  ...championData.passive,
                  image: getPassiveImageUrl(championData.passive.image?.full?.replace(".png", "")),
                }
              : null,
          }

          setChampion(transformedChampion)
        } else {
          setError("Champion not found")
        }
      } catch (error) {
        console.error("Error fetching champion details:", error)
        setError("Failed to load champion details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (version && !ddLoading) {
      fetchChampionDetails()
    }
  }, [championId, version, ddLoading])

  if (loading || ddLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/champions" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Champions
        </Link>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/champions" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Champions
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  if (!champion) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/champions" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Champions
        </Link>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-700">Champion not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/champions" className="inline-flex items-center text-blue-500 hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Champions
      </Link>

      {/* Champion Header */}
      <div className="relative rounded-lg overflow-hidden mb-8">
        <div className="absolute inset-0">
          <img
            src={champion.splash || "/placeholder.svg"}
            alt={champion.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        </div>
        <div className="relative px-8 py-20 sm:py-32 flex flex-col items-start">
          <div className="flex items-center mb-4">
            <img
              src={champion.image || "/placeholder.svg"}
              alt={champion.name}
              className="w-16 h-16 rounded-full border-2 border-white mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold text-white">{champion.name}</h1>
              <p className="text-xl text-gray-200">{champion.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {champion.tags &&
              champion.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("abilities")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === "abilities"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Abilities
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === "stats"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Stats
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Lore</h2>
            <p className="text-gray-700 mb-6">{champion.lore}</p>

            <h3 className="text-xl font-bold mb-3">Champion Type</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {champion.tags &&
                champion.tags.map((tag) => (
                  <div key={tag} className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                    <span>{tag}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "abilities" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Abilities</h2>

            {/* Passive */}
            {champion.passive && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded mr-4 flex-shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src={champion.passive.image || "/placeholder.svg"}
                      alt={champion.passive.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Passive: {champion.passive.name}</h3>
                    <p className="text-gray-700">{champion.passive.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Spells */}
            {champion.spells &&
              champion.spells.map((spell, index) => (
                <div key={spell.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="relative mr-4">
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={spell.image || "/placeholder.svg"}
                          alt={spell.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        {["Q", "W", "E", "R"][index]}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{spell.name}</h3>
                      <p className="text-gray-700">{spell.description}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Base Stats</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-3">Offensive</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Sword className="h-5 w-5 mr-2 text-red-500" />
                      <span>Attack Damage</span>
                    </div>
                    <span className="font-medium">
                      {champion.stats?.attackdamage} (+{champion.stats?.attackdamageperlevel} per level)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                      <span>Attack Speed</span>
                    </div>
                    <span className="font-medium">
                      {champion.stats?.attackspeed?.toFixed(3)} (+
                      {(champion.stats?.attackspeedperlevel / 100)?.toFixed(3)} per level)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Sword className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Attack Range</span>
                    </div>
                    <span className="font-medium">{champion.stats?.attackrange}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">Defensive</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      <span>Health</span>
                    </div>
                    <span className="font-medium">
                      {champion.stats?.hp} (+{champion.stats?.hpperlevel} per level)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Armor</span>
                    </div>
                    <span className="font-medium">
                      {champion.stats?.armor} (+{champion.stats?.armorperlevel} per level)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-500" />
                      <span>Magic Resist</span>
                    </div>
                    <span className="font-medium">
                      {champion.stats?.spellblock} (+{champion.stats?.spellblockperlevel} per level)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Movement Speed</span>
                    </div>
                    <span className="font-medium">{champion.stats?.movespeed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">Resource & Other Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Mana</span>
                    <span className="font-medium">
                      {champion.stats?.mp} (+{champion.stats?.mpperlevel} per level)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mana Regen</span>
                    <span className="font-medium">
                      {champion.stats?.mpregen} (+{champion.stats?.mpregenperlevel} per level)
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Health Regen</span>
                    <span className="font-medium">
                      {champion.stats?.hpregen} (+{champion.stats?.hpregenperlevel} per level)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Crit Chance</span>
                    <span className="font-medium">{champion.stats?.crit}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChampionDetailPage
