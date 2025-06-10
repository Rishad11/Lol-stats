require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  RIOT_API_KEY: process.env.RIOT_API_KEY,
};
