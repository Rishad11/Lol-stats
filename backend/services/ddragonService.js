const axios = require("axios")
const cache = require("../utils/cache")

const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com"
const DEFAULT_VERSION = "14.1.1" // Fallback version

class DDragonService {
  constructor() {
    this.currentVersion = null
  }

  // Get the latest version
  async getVersions() {
    const cacheKey = "ddragon:versions"
    let versions = cache.get(cacheKey)

    if (!versions) {
      try {
        const response = await axios.get(`${DDRAGON_BASE_URL}/api/versions.json`)
        versions = response.data
        cache.set(cacheKey, versions, 3600) // Cache for 1 hour
      } catch (error) {
        console.error("Error fetching versions:", error)
        throw new Error("Failed to fetch Data Dragon versions")
      }
    }

    return versions
  }

  // Get current version (latest)
  async getCurrentVersion() {
    if (!this.currentVersion) {
      try {
        const versions = await this.getVersions()
        this.currentVersion = versions[0] || DEFAULT_VERSION
      } catch (error) {
        console.error("Error getting current version:", error)
        this.currentVersion = DEFAULT_VERSION
      }
    }
    return this.currentVersion
  }

  // Get all champions
  async getChampions(version = null) {
    if (!version) {
      version = await this.getCurrentVersion()
    }

    const cacheKey = `ddragon:champions:${version}`
    let champions = cache.get(cacheKey)

    if (!champions) {
      try {
        const response = await axios.get(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion.json`)
        champions = response.data
        cache.set(cacheKey, champions, 7200) // Cache for 2 hours
      } catch (error) {
        console.error("Error fetching champions:", error)
        throw new Error("Failed to fetch champions data")
      }
    }

    return champions
  }

  // Get specific champion details
  async getChampion(championId, version = null) {
    if (!version) {
      version = await this.getCurrentVersion()
    }

    const cacheKey = `ddragon:champion:${championId}:${version}`
    let champion = cache.get(cacheKey)

    if (!champion) {
      try {
        const response = await axios.get(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`)
        champion = response.data
        cache.set(cacheKey, champion, 7200) // Cache for 2 hours
      } catch (error) {
        console.error(`Error fetching champion ${championId}:`, error)
        throw new Error(`Failed to fetch champion ${championId} data`)
      }
    }

    return champion
  }

  // Get summoner spells
  async getSummonerSpells(version = null) {
    if (!version) {
      version = await this.getCurrentVersion()
    }

    const cacheKey = `ddragon:summoner-spells:${version}`
    let spells = cache.get(cacheKey)

    if (!spells) {
      try {
        const response = await axios.get(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/summoner.json`)
        spells = response.data
        cache.set(cacheKey, spells, 7200) // Cache for 2 hours
      } catch (error) {
        console.error("Error fetching summoner spells:", error)
        throw new Error("Failed to fetch summoner spells data")
      }
    }

    return spells
  }

  // Get items
  async getItems(version = null) {
    if (!version) {
      version = await this.getCurrentVersion()
    }

    const cacheKey = `ddragon:items:${version}`
    let items = cache.get(cacheKey)

    if (!items) {
      try {
        const response = await axios.get(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/item.json`)
        items = response.data
        cache.set(cacheKey, items, 7200) // Cache for 2 hours
      } catch (error) {
        console.error("Error fetching items:", error)
        throw new Error("Failed to fetch items data")
      }
    }

    return items
  }

  // Get runes
  async getRunes(version = null) {
    if (!version) {
      version = await this.getCurrentVersion()
    }

    const cacheKey = `ddragon:runes:${version}`
    let runes = cache.get(cacheKey)

    if (!runes) {
      try {
        const response = await axios.get(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/runesReforged.json`)
        runes = response.data
        cache.set(cacheKey, runes, 7200) // Cache for 2 hours
      } catch (error) {
        console.error("Error fetching runes:", error)
        throw new Error("Failed to fetch runes data")
      }
    }

    return runes
  }

  // Get profile icons
  async getProfileIcons(version = null) {
    if (!version) {
      version = await this.getCurrentVersion()
    }

    const cacheKey = `ddragon:profile-icons:${version}`
    let icons = cache.get(cacheKey)

    if (!icons) {
      try {
        const response = await axios.get(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/profileicon.json`)
        icons = response.data
        cache.set(cacheKey, icons, 7200) // Cache for 2 hours
      } catch (error) {
        console.error("Error fetching profile icons:", error)
        throw new Error("Failed to fetch profile icons data")
      }
    }

    return icons
  }

  // Generate asset URLs
  getAssetUrls(version = null) {
    if (!version) {
      version = this.currentVersion || DEFAULT_VERSION
    }

    // Return string templates with placeholders
    return {
      champion:       `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/{id}.png`,
      championSquare: `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/{id}.png`,
      championSplash: `${DDRAGON_BASE_URL}/cdn/img/champion/splash/{id}_{skinNum}.jpg`,
      championLoading: `${DDRAGON_BASE_URL}/cdn/img/champion/loading/{id}_{skinNum}.jpg`,
      spell:          `${DDRAGON_BASE_URL}/cdn/${version}/img/spell/{id}.png`,
      item:           `${DDRAGON_BASE_URL}/cdn/${version}/img/item/{id}.png`,
      profileIcon:    `${DDRAGON_BASE_URL}/cdn/${version}/img/profileicon/{id}.png`,
      passive:        `${DDRAGON_BASE_URL}/cdn/${version}/img/passive/{id}.png`,
      rune:           `${DDRAGON_BASE_URL}/cdn/img/perk-images/Styles/{tree}/{name}/{name}.png`, // updated
      runeTree:       `${DDRAGON_BASE_URL}/cdn/img/perk-images/Styles/{id}.png`,
    }
  }
}

module.exports = new DDragonService()
