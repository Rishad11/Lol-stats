// Helper functions that construct URLs using the current version
export const buildChampionUrl = (championId, version) => {
  if (!version || !championId) {
    return `/placeholder.svg?height=64&width=64&text=${championId?.charAt(0) || "?"}`
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`
}

export const buildChampionSplashUrl = (championId, skinNum = 0) => {
  if (!championId) {
    return `/placeholder.svg?height=300&width=600&text=${championId || "?"}`
  }
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`
}

export const buildItemUrl = (itemId, version) => {
  if (!version || !itemId || itemId === 0) {
    return `/placeholder.svg?height=32&width=32&text=?`
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`
}

export const buildSpellUrl = (spellId, version) => {
  if (!version || !spellId) {
    return `/placeholder.svg?height=32&width=32&text=?`
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellId}.png`
}

export const buildProfileIconUrl = (iconId, version) => {
  if (!version || !iconId) {
    return `/placeholder.svg?height=64&width=64&text=${iconId || "?"}`
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`
}

export const buildPassiveUrl = (passiveId, version) => {
  if (!version || !passiveId) {
    return `/placeholder.svg?height=32&width=32&text=P`
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${passiveId}.png`
}

export const buildSummonerSpellUrl = (spellId, version, summonerSpells) => {
  if (!version || !spellId) {
    return `/placeholder.svg?height=32&width=32&text=?`
  }
  const spellName = summonerSpells[spellId]
  if (!spellName) {
    return `/placeholder.svg?height=32&width=32&text=${spellId}`
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellName}.png`
}

export const buildKeystoneRuneUrl = (runeId, keystoneRunes) => {
  if (!runeId) {
    return `/placeholder.svg?height=32&width=32&text=R`
  }

  const rune = keystoneRunes[runeId]
  if (!rune) {
    return `/placeholder.svg?height=32&width=32&text=${runeId}`
  }

  return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${rune.tree}/${rune.name}/${rune.name}.png`
}

export const buildRuneTreeUrl = (styleId, runeStyles) => {
  if (!styleId) {
    return `/placeholder.svg?height=32&width=32&text=T`
  }

  const styleName = runeStyles[styleId]
  if (!styleName) {
    return `/placeholder.svg?height=32&width=32&text=${styleId}`
  }

  return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${styleName}.png`
}

export const getRuneTreeColor = (styleId) => {
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

export const getRuneTreeAbbr = (styleId) => {
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
