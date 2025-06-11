"use client"

import { useState, useEffect } from "react"
import { getCurrentVersion, getAssetUrls } from "../services/ddragonService"
import { summonerSpells } from "../utils/ddragon/summonerSpells"
import { runeStyles } from "../utils/ddragon/runeStyles"
import { keystoneRunes } from "../utils/ddragon/keystoneRunes"
import {
  getRuneTreeColor,
  getRuneTreeAbbr,
} from "../utils/ddragon/imageHelpers"

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

        const versionResponse = await getCurrentVersion()
        const currentVersion = versionResponse.data.version
        const urlsResponse = await getAssetUrls(currentVersion)

        setVersion(currentVersion)
        setAssetUrls(urlsResponse.data.urls)
      } catch (err) {
        console.error("Error initializing Data Dragon:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeDataDragon()
  }, [])

  // Helper to fill in template strings
  const make = (template, vars) =>
    template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "")

  // Helper functions that use assetUrls from backend
  const getChampionImageUrl = (championId) =>
    assetUrls?.champion ? make(assetUrls.champion, { id: championId }) : "/placeholder.svg"
  const getChampionSplashUrl = (championId, skinNum = 0) =>
    assetUrls?.championSplash ? make(assetUrls.championSplash, { id: championId, skinNum }) : "/placeholder.svg"
  const getItemImageUrl = (itemId) =>
    assetUrls?.item ? make(assetUrls.item, { id: itemId }) : "/placeholder.svg"
  const getSpellImageUrl = (spellId) =>
    assetUrls?.spell ? make(assetUrls.spell, { id: spellId }) : "/placeholder.svg"
  const getProfileIconUrl = (iconId) =>
    assetUrls?.profileIcon ? make(assetUrls.profileIcon, { id: iconId }) : "/placeholder.svg"
  const getPassiveImageUrl = (passiveId) =>
    assetUrls?.passive ? make(assetUrls.passive, { id: passiveId }) : "/placeholder.svg"
  const getSummonerSpellImageUrl = (spellKeyOrId) => {
    if (!assetUrls?.spell) return "/placeholder.svg"
    let spellName = spellKeyOrId
    if (summonerSpells && summonerSpells[spellKeyOrId]) {
      spellName = summonerSpells[spellKeyOrId]
    }
    return make(assetUrls.spell, { id: spellName })
  }
  const getKeystoneRuneImageUrl = (runeId) => {
    if (!assetUrls?.rune || !keystoneRunes) return "/placeholder.svg"
    const rune = keystoneRunes[runeId]
    if (!rune) return "/placeholder.svg"
    // Use placeholders: {tree} and {name}
    return make(assetUrls.rune, { tree: rune.tree, name: rune.name })
  }
  const getRuneTreeImageUrl = (styleId) => {
    if (!assetUrls?.runeTree || !runeStyles) return "/placeholder.svg"
    const styleName = runeStyles[styleId]
    if (!styleName) return "/placeholder.svg"
    return make(assetUrls.runeTree, { id: styleName })
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
    // If you need keystone rune, rune tree images, add similar helpers here
    getRuneTreeColor,
    getRuneTreeAbbr,
    summonerSpells,
    runeStyles,
    keystoneRunes,
  }
}
