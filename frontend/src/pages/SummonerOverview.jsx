"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Shield, Sword, Award, Users } from "lucide-react"
import axios from "axios"
import SummonerTabs from "../components/summonertabs"

// Bring back your ddragon maps
const summonerSpells = {
  21: "SummonerBarrier",
  1: "SummonerBoost",
  14: "SummonerDot",
  3: "SummonerExhaust",
  4: "SummonerFlash",
  6: "SummonerHaste",
  7: "SummonerHeal",
  13: "SummonerMana",
  30: "SummonerPoroRecall",
  31: "SummonerPoroThrow",
  11: "SummonerSmite",
  39: "SummonerSnowURFSnowball_Mark",
  32: "SummonerSnowball",
  12: "SummonerTeleport",
}

const runeStyles = {
  8000: "7201_Precision",
  8100: "7200_Domination",
  8200: "7202_Sorcery",
  8300: "7203_Whimsy",
  8400: "7204_Resolve",
}

const keystoneRunes = {
  8005: "PressTheAttack",
  8008: "LethalTempo",
  8021: "FleetFootwork",
  8010: "Conqueror",
  8112: "Electrocute",
  8124: "Predator",
  8128: "DarkHarvest",
  9923: "HailOfBlades",
  8214: "SummonAery",
  8229: "ArcaneComet",
  8230: "PhaseRush",
  8437: "GraspOfTheUndying",
  8439: "VeteranAftershock",
  8465: "Guardian",
  8351: "GlacialAugment",
  8360: "UnsealedSpellbook",
  8369: "FirstStrike",
  8326: "UnsealedSpellbook",
  8358: "MasterKey",
  8359: "Kleptomancy",
  9101: "Overheal",
  9111: "Triumph",
  8143: "SuddenImpact",
  8136: "CheapShot",
}

// Game mode mappings
const gameTypeMap = {
  400: "Normal Draft",
  420: "Ranked Solo/Duo",
  430: "Normal Blind",
  440: "Ranked Flex",
  450: "ARAM",
  700: "Clash",
  830: "Co-op vs AI Intro",
  840: "Co-op vs AI Beginner",
  850: "Co-op vs AI Intermediate",
  900: "URF",
  1020: "One for All",
  1300: "Nexus Blitz",
  1400: "Ultimate Spellbook",
  1700: "Arena",
  1900: "Pick URF",
  2000: "Tutorial",
  2010: "Tutorial",
  2020: "Tutorial",
}

const SummonerOverview = () => {
  const { region, summonerName } = useParams()
  const [summoner, setSummoner] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [matchDetails, setMatchDetails] = useState({})

  const toggleDetails = async (matchId) => {
    const current = matchDetails[matchId]
    if (current && current.data) {
      setMatchDetails((prev) => ({
        ...prev,
        [matchId]: { ...prev[matchId], expanded: !prev[matchId].expanded },
      }))
    } else {
      try {
        const res = await axios.get(`/api/summoner/${region}/match/${matchId}/details`)
        setMatchDetails((prev) => ({
          ...prev,
          [matchId]: { data: res.data, expanded: true },
        }))
      } catch (err) {
        console.error("Error fetching match details", err)
      }
    }
  }

  useEffect(() => {
    const fetchSummonerData = async () => {
      try {
        setLoading(true)
        setError(null)
        let summonerData

        if (summonerName.includes("#")) {
          const [gameName, tagLine] = summonerName.split("#")
          const accountResponse = await axios.get(
            `/api/account/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
          )
          const { puuid } = accountResponse.data
          const summonerResponse = await axios.get(`/api/summoner/by-puuid/${region}/${puuid}`)
          summonerData = summonerResponse.data
          // Store the original searched name for display
          summonerData.searchedName = `${gameName}#${tagLine}`
        } else {
          const summonerResponse = await axios.get(`/api/summoner/${region}/${encodeURIComponent(summonerName)}`)
          summonerData = summonerResponse.data
          summonerData.searchedName = summonerName
        }

        const rankResponse = await axios.get(`/api/summoner/${region}/${summonerData.id}/rank`)
        summonerData.rank = rankResponse.data?.[0] || null

        if (summonerData.rank) {
          summonerData.totalGames = summonerData.rank.wins + summonerData.rank.losses
          summonerData.winRate = Math.round((summonerData.rank.wins / summonerData.totalGames) * 100)
        }

        setSummoner(summonerData)

        try {
          const matchesResponse = await axios.get(`/api/summoner/${region}/${summonerData.puuid}/matches`)
          setMatches(matchesResponse.data)
        } catch (matchError) {
          console.error("Error fetching matches:", matchError)
          setMatches([])
        }
      } catch (err) {
        console.error("Error fetching summoner data:", err)
        const errorMessage = err.response?.data?.error || err.message

        if (err.response?.status === 404) {
          setError(`Summoner "${summonerName}" not found in ${region.toUpperCase()} region.`)
        } else if (err.response?.status === 403) {
          setError(`API key invalid or expired. Please check your API key.`)
        } else {
          setError(`Failed to load summoner data: ${errorMessage}`)
        }

        setSummoner(null)
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    fetchSummonerData()
  }, [region, summonerName])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Loading summoner data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg
                className="fill-current h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!summoner) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-700">Summoner not found</h2>
        </div>
      </div>
    )
  }

  // Calculate stats from match history
  const totalGames = matches.length
  const wins = matches.filter((match) => match.win).length
  const losses = totalGames - wins
  const winRateFromMatches = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      {/* Enhanced Summoner Profile */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 p-1 shadow-lg">
              <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.profileIconId}.png`}
                  alt={summoner.searchedName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `/placeholder.svg?height=128&width=128&text=${summoner.searchedName.charAt(0)}`
                  }}
                />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl px-3 py-2 shadow-lg">
              {summoner.summonerLevel}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {summoner.searchedName}
              </h1>
              <p className="text-slate-500 mt-1">{region.toUpperCase()} • Summoner Overview</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                <div className="text-sm opacity-90">Rank</div>
                <div className="font-bold text-lg">
                  {summoner.rank ? `${summoner.rank.tier} ${summoner.rank.rank}` : "Unranked"}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="text-sm text-slate-500">LP</div>
                <div className="font-bold text-lg text-slate-800">{summoner.rank?.leaguePoints || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="text-sm text-slate-500">Win Rate</div>
                <div className="font-bold text-lg text-emerald-600">{summoner.winRate || 0}%</div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="text-sm text-slate-500">Games</div>
                <div className="font-bold text-lg text-slate-800">
                  <span className="text-emerald-500">{summoner.rank?.wins || 0}W</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-red-500">{summoner.rank?.losses || 0}L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <SummonerTabs region={region} summonerName={summonerName} />

      {/* Match History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Match History</h2>

        {matches.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No recent matches found for this summoner.</p>
          </div>
        ) : (
          matches.map((match) => {
            // Temporary debugging - remove this after fixing
            console.log("Match object keys:", Object.keys(match))
            console.log("Match queue info:", {
              queueId: match.queueId,
              queue: match.queue,
              gameMode: match.gameMode,
              gameType: match.gameType,
            })
            console.log("Match items:", { item0: match.item0, item1: match.item1, items: match.items })

            return (
              <div
                key={match.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                  match.win ? "border-blue-500" : "border-red-500"
                }`}
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.champion}.png`}
                          alt={match.champion}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = `/placeholder.svg?height=64&width=64&text=${match.champion.charAt(0)}`
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <h3 className="font-bold">{match.champion}</h3>
                          <p className={`text-sm ${match.win ? "text-blue-500" : "text-red-500"}`}>
                            {match.win ? "Victory" : "Defeat"} • {match.role}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(match.gameCreation).toLocaleDateString()} • {Math.floor(match.gameDuration / 60)}:
                            {(match.gameDuration % 60).toString().padStart(2, "0")} •{" "}
                            {gameTypeMap[match.queueId] || gameTypeMap[match.queue] || match.gameMode || "Unknown"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="text-lg font-bold">
                            {match.kills} / <span className="text-red-500">{match.deaths}</span> / {match.assists}
                          </div>
                          <div className="text-sm text-gray-500">
                            {((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2)} KDA
                          </div>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Items:</span>
                        <div className="flex gap-1">
                          {/* Check if items exist in match object, otherwise show placeholders */}
                          {match.items && match.items.length > 0
                            ? match.items.slice(0, 7).map((id, i) =>
                                id > 0 ? (
                                  <img
                                    key={i}
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${id}.png`}
                                    alt="Item"
                                    className="w-8 h-8 rounded border border-gray-200"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = `/placeholder.svg?height=32&width=32&text=?`
                                    }}
                                  />
                                ) : (
                                  <div key={i} className="w-8 h-8 rounded border border-gray-200 bg-gray-100"></div>
                                ),
                              )
                            : /* If no items array, try individual item properties */
                              [
                                match.item0,
                                match.item1,
                                match.item2,
                                match.item3,
                                match.item4,
                                match.item5,
                                match.item6,
                              ].map((id, i) =>
                                id && id > 0 ? (
                                  <img
                                    key={i}
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${id}.png`}
                                    alt="Item"
                                    className="w-8 h-8 rounded border border-gray-200"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = `/placeholder.svg?height=32&width=32&text=?`
                                    }}
                                  />
                                ) : (
                                  <div key={i} className="w-8 h-8 rounded border border-gray-200 bg-gray-100"></div>
                                ),
                              )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <Sword className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">
                            CS: {match.cs} ({(match.cs / (match.gameDuration / 60)).toFixed(1)})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">Vision: {match.visionScore || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{match.multikill || "No"} Multikill</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">
                            {gameTypeMap[match.queueId] || gameTypeMap[match.queue] || match.gameMode || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle details button */}
                  <button
                    onClick={() => toggleDetails(match.id)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    {matchDetails[match.id]?.expanded ? "Hide Details" : "Show Details"}
                  </button>

                  {/* Render additional match details if toggled */}
                  {matchDetails[match.id]?.expanded && matchDetails[match.id]?.data && (
                    <div className="p-4 bg-gray-50 mt-4 rounded">
                      <h4 className="text-lg font-bold mb-4">Match Details</h4>

                      {/* Team Split Details Block */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[100, 200].map((teamId) => (
                          <div key={teamId} className="space-y-3">
                            <h5
                              className={`font-semibold text-lg ${teamId === 100 ? "text-blue-600" : "text-red-600"}`}
                            >
                              {teamId === 100 ? "Blue Team" : "Red Team"}
                            </h5>
                            {matchDetails[match.id].data.info.participants
                              .filter((p) => p.teamId === teamId)
                              .map((participant) => (
                                <div
                                  key={participant.puuid}
                                  className="flex items-center space-x-3 p-3 bg-white rounded-lg border"
                                >
                                  {/* Champion Image */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${participant.championName}.png`}
                                      alt={participant.championName}
                                      className="w-8 h-8 rounded"
                                      onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = `/placeholder.svg?height=32&width=32&text=${participant.championName.charAt(0)}`
                                      }}
                                    />
                                  </div>

                                  {/* Summoner Name */}
                                  <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium truncate block">
                                      {participant.riotIdGameName || participant.summonerName || "Unknown"}
                                    </span>
                                  </div>

                                  {/* Summoner Spells */}
                                  <div className="flex space-x-1">
                                    {[participant.summoner1Id, participant.summoner2Id].map((spellId, i) => {
                                      const spellName = summonerSpells[spellId]
                                      return spellName ? (
                                        <img
                                          key={i}
                                          src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${spellName}.png`}
                                          alt={`Summoner Spell ${spellId}`}
                                          className="w-5 h-5 rounded"
                                          onError={(e) => {
                                            e.target.style.display = "none"
                                          }}
                                        />
                                      ) : (
                                        <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
                                      )
                                    })}
                                  </div>

                                  {/* Primary and Secondary Runes */}
                                  <div className="flex space-x-1">
                                    {participant.perks?.styles?.length >= 1 && (
                                      <>
                                        {/* Primary Keystone Rune */}
                                        {(() => {
                                          const primaryStyle = participant.perks.styles[0]
                                          if (primaryStyle?.selections?.[0]) {
                                            const keystoneId = primaryStyle.selections[0].perk
                                            const keystoneName = keystoneRunes[keystoneId]

                                            // Define colors for different rune trees
                                            const getRuneColor = (styleId) => {
                                              switch (styleId) {
                                                case 8000:
                                                  return "bg-yellow-500" // Precision
                                                case 8100:
                                                  return "bg-red-500" // Domination
                                                case 8200:
                                                  return "bg-blue-500" // Sorcery
                                                case 8300:
                                                  return "bg-teal-500" // Inspiration
                                                case 8400:
                                                  return "bg-green-500" // Resolve
                                                default:
                                                  return "bg-gray-500"
                                              }
                                            }

                                            return (
                                              <div
                                                className={`w-5 h-5 rounded flex items-center justify-center ${getRuneColor(primaryStyle.style)}`}
                                              >
                                                <span
                                                  className="text-xs font-bold text-white"
                                                  style={{ fontSize: "8px" }}
                                                  title={`${keystoneName || "Unknown Keystone"} (ID: ${keystoneId})`}
                                                >
                                                  {keystoneName
                                                    ? keystoneName.slice(0, 2).toUpperCase()
                                                    : keystoneId.toString().slice(-2)}
                                                </span>
                                              </div>
                                            )
                                          }
                                          return (
                                            <div className="w-5 h-5 bg-gray-200 rounded" title="No primary rune"></div>
                                          )
                                        })()}

                                        {/* Secondary Rune Tree */}
                                        {participant.perks.styles.length >= 2 &&
                                          (() => {
                                            const secondaryStyle = participant.perks.styles[1]
                                            const styleIcon = runeStyles[secondaryStyle?.style]
                                            return styleIcon ? (
                                              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center relative">
                                                <img
                                                  src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${styleIcon}.png`}
                                                  alt="Secondary Rune Tree"
                                                  className="w-full h-full rounded absolute inset-0"
                                                  style={{ display: "none" }}
                                                  onLoad={(e) => {
                                                    e.target.style.display = "block"
                                                    e.target.parentNode.style.backgroundColor = "transparent"
                                                  }}
                                                  onError={(e) => {
                                                    e.target.style.display = "none"
                                                  }}
                                                />
                                                <span
                                                  className="text-xs font-bold text-white z-10"
                                                  style={{ fontSize: "8px" }}
                                                >
                                                  {styleIcon ? styleIcon.split("_")[1].slice(0, 2).toUpperCase() : "S"}
                                                </span>
                                              </div>
                                            ) : (
                                              <div
                                                className="w-5 h-5 bg-gray-200 rounded"
                                                title="No secondary rune"
                                              ></div>
                                            )
                                          })()}
                                      </>
                                    )}
                                  </div>

                                  {/* KDA */}
                                  <div className="text-xs text-center min-w-[60px]">
                                    <div className="font-medium">
                                      {participant.kills}/{participant.deaths}/{participant.assists}
                                    </div>
                                    <div className="text-gray-500">
                                      {(
                                        (participant.kills + participant.assists) /
                                        Math.max(1, participant.deaths)
                                      ).toFixed(1)}{" "}
                                      KDA
                                    </div>
                                  </div>

                                  {/* CS and Vision Score */}
                                  <div className="text-xs text-center min-w-[50px]">
                                    <div className="font-medium">
                                      {participant.totalMinionsKilled + participant.neutralMinionsKilled} CS
                                    </div>
                                    <div className="text-gray-500">VS: {participant.visionScore}</div>
                                  </div>

                                  {/* Items */}
                                  <div className="flex space-x-1">
                                    {[
                                      participant.item0,
                                      participant.item1,
                                      participant.item2,
                                      participant.item3,
                                      participant.item4,
                                      participant.item5,
                                      participant.item6,
                                    ]
                                      .filter((id) => id > 0)
                                      .slice(0, 6)
                                      .map((id, i) => (
                                        <img
                                          key={i}
                                          src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${id}.png`}
                                          alt="Item"
                                          className="w-5 h-5 rounded"
                                          onError={(e) => {
                                            e.target.style.display = "none"
                                          }}
                                        />
                                      ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SummonerOverview
