// Map region keys -> Riot platform codes
export const regionPlatformMap = {
  na: "NA1",
  euw: "EUW1",
  eune: "EUN1",
  kr: "KR",
  jp: "JP1",
}

export const getPlatformCode = (region) => {
  return regionPlatformMap[region.toLowerCase()]?.toLowerCase()
}

export const getRegionOptions = () => [
  { value: "na", label: "North America" },
  { value: "euw", label: "Europe West" },
  { value: "eune", label: "Europe Nordic & East" },
  { value: "kr", label: "Korea" },
  { value: "jp", label: "Japan" },
]
