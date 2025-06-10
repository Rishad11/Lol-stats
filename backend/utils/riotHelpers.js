const { regionToCluster } = require("./regions");
const config = require("../config/config");

// Helper for Riot API headers
function riotHeaders() {
  return { "X-Riot-Token": config.RIOT_API_KEY };
}

// Helper for delaying
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper for platform region calculation
function getPlatformRegion(region) {
  region = region.toLowerCase();
  return regionToCluster[region] ||
    (region.startsWith("euw") || region.startsWith("eune") || region.startsWith("tr") || region.startsWith("ru")
      ? "europe"
      : region.startsWith("na") || region.startsWith("br") || region.startsWith("lan") || region.startsWith("las")
        ? "americas"
        : "asia");
}

module.exports = {
  riotHeaders,
  delay,
  getPlatformRegion,
};
