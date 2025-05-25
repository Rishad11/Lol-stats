import { Link, useLocation } from "react-router-dom"

const SummonerTabs = ({ region, summonerName }) => {
  const location = useLocation()
  const currentPath = location.pathname

  const isOverviewActive =
    currentPath === `/summoner/${region}/${summonerName}` ||
    currentPath === `/summoner/${region}/${summonerName}/overview`
  const isChampionStatsActive = currentPath === `/summoner/${region}/${summonerName}/champion-stats`

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex -mb-px">
        <Link
          to={`/summoner/${region}/${encodeURIComponent(summonerName)}`}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            isOverviewActive
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Overview
        </Link>
        <Link
          to={`/summoner/${region}/${encodeURIComponent(summonerName)}/champion-stats`}
          className={`py-4 px-6 font-medium text-sm border-b-2 ${
            isChampionStatsActive
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Champions
        </Link>
        <button
          className="py-4 px-6 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          disabled
        >
          Live Game
        </button>
      </nav>
    </div>
  )
}

export default SummonerTabs
