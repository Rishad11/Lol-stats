const express = require("express")
const config = require("./config/config")
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")

const { rateLimiter } = require("./middleware/rateLimiter")
const { errorHandler } = require("./middleware/errorHandler")

// Import routes (match current filenames)
const championsRoutes = require("./routes/championsRoutes")
const summonerRoutes = require("./routes/summonerRoutes")
const leaderboardsRoutes = require("./routes/leaderboardsRoutes")
const regionsRoutes = require("./routes/regionsRoutes")
const searchRoutes = require("./routes/searchRoutes")
const accountRoutes = require("./routes/accountRoutes")

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
  }),
)
app.use(rateLimiter)

// Routes
app.use("/api/champions", championsRoutes)
app.use("/api/summoner", summonerRoutes)
app.use("/api/leaderboards", leaderboardsRoutes)
app.use("/api/regions", regionsRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/account", accountRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})

module.exports = app
