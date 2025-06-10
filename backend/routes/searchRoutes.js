const express = require("express")
const router = express.Router()
const axios = require("axios")
const cache = require("../utils/cache")
const { regionToHost, regionToCluster } = require("../utils/regions")
const { riotHeaders } = require("../utils/riotHelpers")

// Search for champions
router.get("/champions", async (req, res) => {
  try {
    const { query } = req.query

    if (!query || query.length < 2) {
      return res.json([])
    }

    // Check cache first
    const cacheKey = `search:champions:${query.toLowerCase()}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Fetch latest version
    const versionsResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
    const latestVersion = versionsResponse.data[0]

    // Fetch champions data
    const championsResponse = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`,
    )

    const championsData = championsResponse.data.data

    // Filter champions by query
    const filteredChampions = Object.values(championsData)
      .filter((champion) => champion.name.toLowerCase().includes(query.toLowerCase()))
      .map((champion) => ({
        id: champion.id,
        name: champion.name,
        title: champion.title,
        image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`,
      }))
      .slice(0, 10) // Limit to 10 results

    // Cache the result for 1 hour (3600 seconds)
    cache.set(cacheKey, filteredChampions, 3600)

    res.json(filteredChampions)
  } catch (error) {
    console.error("Error searching champions:", error.message)
    res.status(500).json({ error: "Failed to search champions" })
  }
})

// Search for summoners by Riot ID
router.get("/summoners/:region", async (req, res) => {
  try {
    const { region } = req.params
    const { query } = req.query

    if (!query || query.length < 3) {
      return res.json([])
    }

    // Check if region is valid
    if (!regionToCluster[region]) {
      return res.status(400).json({ error: "Invalid region" })
    }

    // Check cache first
    const cacheKey = `search:summoners:${region}:${query.toLowerCase()}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Parse the query to get gameName and tagLine
    // Format is typically "gameName#tagLine"
    let gameName, tagLine

    if (query.includes("#")) {
      ;[gameName, tagLine] = query.split("#")
    } else {
      // If no tagLine is provided, we'll search without it
      gameName = query
      // We'll try to search by summoner name using the summoner-v4 API
      try {
        const summonerResponse = await axios.get(
          `https://${regionToHost[region]}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(query)}`,
          { headers: riotHeaders() },
        )

        const summonerData = summonerResponse.data

        const result = [
          {
            id: summonerData.id,
            name: summonerData.name,
            profileIconId: summonerData.profileIconId,
            summonerLevel: summonerData.summonerLevel,
            puuid: summonerData.puuid,
            region,
            image: `https://ddragon.leagueoflegends.com/cdn/13.10.1/img/profileicon/${summonerData.profileIconId}.png`,
          },
        ]

        // Cache the result for 5 minutes (300 seconds)
        cache.set(cacheKey, result, 300)

        return res.json(result)
      } catch (error) {
        // If summoner not found by name, return empty array
        if (error.response?.status === 404) {
          return res.json([])
        }
        throw error
      }
    }

    // If we have both gameName and tagLine, use the account-v1 API
    if (gameName && tagLine) {
      try {
        const accountResponse = await axios.get(
          `https://${regionToCluster[region]}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
          { headers: riotHeaders() },
        )

        const accountData = accountResponse.data

        // Now we need to get the summoner data using the PUUID
        const summonerResponse = await axios.get(
          `https://${regionToHost[region]}/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`,
          { headers: riotHeaders() },
        )

        const summonerData = summonerResponse.data

        const result = [
          {
            id: summonerData.id,
            name: summonerData.name,
            profileIconId: summonerData.profileIconId,
            summonerLevel: summonerData.summonerLevel,
            puuid: summonerData.puuid,
            region,
            gameName: accountData.gameName,
            tagLine: accountData.tagLine,
            image: `https://ddragon.leagueoflegends.com/cdn/13.10.1/img/profileicon/${summonerData.profileIconId}.png`,
          },
        ]

        // Cache the result for 5 minutes (300 seconds)
        cache.set(cacheKey, result, 300)

        return res.json(result)
      } catch (error) {
        // If account not found, return empty array
        if (error.response?.status === 404) {
          return res.json([])
        }
        throw error
      }
    }

    // If we reach here, we couldn't find the summoner
    return res.json([])
  } catch (error) {
    console.error("Error searching summoners:", error.message)
    console.error("Error details:", error.response?.data || "No response data")

    if (error.response?.status === 403) {
      return res.status(403).json({ error: "API key invalid or expired" })
    }

    res.status(500).json({ error: "Failed to search summoners" })
  }
})

module.exports = router
