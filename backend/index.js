require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

// Import routes
const championsRoutes = require("./routes/championsRoutes")
const summonerRoutes = require("./routes/summonerRoutes")
const leaderboardsRoutes = require("./routes/leaderboardsRoutes")

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
})
app.use(limiter)

// Check for API key
if (!process.env.RIOT_API_KEY) {
  console.warn("WARNING: RIOT_API_KEY environment variable is not set. API calls will fail.")
}

// Routes
app.use("/api/champions", championsRoutes)
app.use("/api/summoner", summonerRoutes)
app.use("/api/leaderboards", leaderboardsRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
