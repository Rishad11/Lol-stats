const axios = require("axios");
const { riotHeaders } = require("../utils/riotHelpers");

async function getAccountByRiotId(gameName, tagLine) {
  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const response = await axios.get(url, { headers: riotHeaders() });
  return response.data;
}

module.exports = { getAccountByRiotId };
