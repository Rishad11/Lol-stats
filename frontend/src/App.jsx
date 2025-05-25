import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/navbar"
import Footer from "./components/footer"
import HomePage from "./pages/HomePage"
import ChampionsPage from "./pages/ChampionsPage"
import ChampionDetailPage from "./pages/ChampionDetailPage"
import LeaderboardsPage from "./pages/LeaderboardsPage"
import SummonerOverview from "./pages/SummonerOverview"
import SummonerChampionStats from "./pages/SummonerChampionStats"

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/summoner/:region/:summonerName" element={<SummonerOverview />} />
            <Route path="/summoner/:region/:summonerName/champion-stats" element={<SummonerChampionStats />} />
            <Route path="/champions" element={<ChampionsPage />} />
            <Route path="/champions/:championId" element={<ChampionDetailPage />} />
            <Route path="/leaderboards" element={<LeaderboardsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
