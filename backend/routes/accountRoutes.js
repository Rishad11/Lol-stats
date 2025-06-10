const express = require("express");
const { getAccountByRiotId } = require("../services/accountService");

const router = express.Router();

router.get("/by-riot-id/:gameName/:tagLine", async (req, res) => {
  const { gameName, tagLine } = req.params;

  try {
    const data = await getAccountByRiotId(gameName, tagLine);
    res.json(data);
  } catch (error) {
    console.error("Error fetching Riot ID:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Internal server error",
    });
  }
});

module.exports = router;
