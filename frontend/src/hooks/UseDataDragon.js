"use client"

import { useState, useEffect } from "react"
import { fetchCurrentVersion, fetchAssetUrls } from "../services/apiCalls"

export const useDataDragon = () => {
  const [version, setVersion] = useState(null)
  const [assetUrls, setAssetUrls] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeDataDragon = async () => {
      try {
        setLoading(true)
        setError(null)

        const currentVersion = await fetchCurrentVersion()
        const urls = await fetchAssetUrls(currentVersion)

        setVersion(currentVersion)
        setAssetUrls(urls)
      } catch (err) {
        console.error("Error initializing Data Dragon:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeDataDragon()
  }, [])

  // Summoner spell mapping
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

  // Rune tree styles mapping
  const runeStyles = {
    8000: "7201_Precision",
    8100: "7200_Domination",
    8200: "7202_Sorcery",
    8300: "7203_Whimsy",
    8400: "7204_Resolve",
  }

  // Keystone runes mapping with their tree paths
  const keystoneRunes = {
    // Precision
    8005: { name: "PressTheAttack", tree: "Precision" },
    8008: { name: "LethalTempo", tree: "Precision" },
    8021: { name: "FleetFootwork", tree: "Precision" },
    8010: { name: "Conqueror", tree: "Precision" },

    // Domination
    8112: { name: "Electrocute", tree: "Domination" },
    8124: { name: "Predator", tree: "Domination" },
    8128: { name: "DarkHarvest", tree: "Domination" },
    9923: { name: "HailOfBlades", tree: "Domination" },

    // Sorcery
    8214: { name: "SummonAery", tree: "Sorcery" },
    8229: { name: "ArcaneComet", tree: "Sorcery" },
    8230: { name: "PhaseRush", tree: "Sorcery" },

    // Resolve
    8437: { name: "GraspOfTheUndying", tree: "Resolve" },
    8439: { name: "VeteranAftershock", tree: "Resolve" },
    8465: { name: "Guardian", tree: "Resolve" },

    // Inspiration
    8351: { name: "GlacialAugment", tree: "Inspiration" },
    8360: { name: "UnsealedSpellbook", tree: "Inspiration" },
    8369: { name: "FirstStrike", tree: "Inspiration" },
  }

  // Helper functions that construct URLs using the current version
  const getChampionImageUrl = (championId) => {
    if (!version || !championId) {
      return `/placeholder.svg?height=64&width=64&text=${championId?.charAt(0) || "?"}`
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`
  }

  const getChampionSplashUrl = (championId, skinNum = 0) => {
    if (!championId) {
      return `/placeholder.svg?height=300&width=600&text=${championId || "?"}`
    }
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`
  }

  const getItemImageUrl = (itemId) => {
    if (!version || !itemId || itemId === 0) {
      return `/placeholder.svg?height=32&width=32&text=?`
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`
  }

  const getSpellImageUrl = (spellId) => {
    if (!version || !spellId) {
      return `/placeholder.svg?height=32&width=32&text=?`
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellId}.png`
  }

  const getProfileIconUrl = (iconId) => {
    if (!version || !iconId) {
      return `/placeholder.svg?height=64&width=64&text=${iconId || "?"}`
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`
  }

  const getPassiveImageUrl = (passiveId) => {
    if (!version || !passiveId) {
      return `/placeholder.svg?height=32&width=32&text=P`
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${passiveId}.png`
  }

  const getSummonerSpellImageUrl = (spellId) => {
    if (!version || !spellId) {
      return `/placeholder.svg?height=32&width=32&text=?`
    }
    const spellName = summonerSpells[spellId]
    if (!spellName) {
      return `/placeholder.svg?height=32&width=32&text=${spellId}`
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellName}.png`
  }

  const getKeystoneRuneImageUrl = (runeId) => {
    if (!runeId) {
      return `/placeholder.svg?height=32&width=32&text=R`
    }

    const rune = keystoneRunes[runeId]
    if (!rune) {
      return `/placeholder.svg?height=32&width=32&text=${runeId}`
    }

    // Try the main keystone path first
    return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${rune.tree}/${rune.name}/${rune.name}.png`
  }

  const getRuneTreeImageUrl = (styleId) => {
    if (!styleId) {
      return `/placeholder.svg?height=32&width=32&text=T`
    }

    const styleName = runeStyles[styleId]
    if (!styleName) {
      return `/placeholder.svg?height=32&width=32&text=${styleId}`
    }

    return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${styleName}.png`
  }

  // Get rune tree color for fallbacks
  const getRuneTreeColor = (styleId) => {
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

  // Get rune tree abbreviation for fallbacks
  const getRuneTreeAbbr = (styleId) => {
    switch (styleId) {
      case 8000:
        return "PR" // Precision
      case 8100:
        return "DO" // Domination
      case 8200:
        return "SO" // Sorcery
      case 8300:
        return "IN" // Inspiration
      case 8400:
        return "RE" // Resolve
      default:
        return "??"
    }
  }

  return {
    version,
    assetUrls,
    loading,
    error,
    getChampionImageUrl,
    getChampionSplashUrl,
    getItemImageUrl,
    getSpellImageUrl,
    getProfileIconUrl,
    getPassiveImageUrl,
    getSummonerSpellImageUrl,
    getKeystoneRuneImageUrl,
    getRuneTreeImageUrl,
    getRuneTreeColor,
    getRuneTreeAbbr,
    // Export the mappings for use in components
    summonerSpells,
    runeStyles,
    keystoneRunes,
  }
}
