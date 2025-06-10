"use client"

import { useState, useEffect } from "react"
import { getCurrentVersion, getAssetUrls } from "../services/ddragonService"
import { summonerSpells } from "../utils/ddragon/summonerSpells"
import { runeStyles } from "../utils/ddragon/runeStyles"
import { keystoneRunes } from "../utils/ddragon/keystoneRunes"
import {
  buildChampionUrl,
  buildChampionSplashUrl,
  buildItemUrl,
  buildSpellUrl,
  buildProfileIconUrl,
  buildPassiveUrl,
  buildSummonerSpellUrl,
  buildKeystoneRuneUrl,
  buildRuneTreeUrl,
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
        setAssetUrls(urlsResponse.data)
      } catch (err) {
        console.error("Error initializing Data Dragon:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeDataDragon()
  }, [])

  // Helper functions that use the current version
  const getChampionImageUrl = (championId) => buildChampionUrl(championId, version)
  const getChampionSplashUrl = (championId, skinNum = 0) => buildChampionSplashUrl(championId, skinNum)
  const getItemImageUrl = (itemId) => buildItemUrl(itemId, version)
  const getSpellImageUrl = (spellId) => buildSpellUrl(spellId, version)
  const getProfileIconUrl = (iconId) => buildProfileIconUrl(iconId, version)
  const getPassiveImageUrl = (passiveId) => buildPassiveUrl(passiveId, version)
  const getSummonerSpellImageUrl = (spellId) => buildSummonerSpellUrl(spellId, version, summonerSpells)
  const getKeystoneRuneImageUrl = (runeId) => buildKeystoneRuneUrl(runeId, keystoneRunes)
  const getRuneTreeImageUrl = (styleId) => buildRuneTreeUrl(styleId, runeStyles)

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
