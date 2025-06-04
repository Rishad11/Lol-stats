import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold">LoL Stats</h2>
            <p className="mt-2 text-sm text-gray-400">
              LoL Stats isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone
              officially involved in producing or managing League of Legends.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 ml-12">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/champions" className="text-gray-400 hover:text-white">
                    Champions
                  </Link>
                </li>
                <li>
                  <Link to="/leaderboards" className="text-gray-400 hover:text-white">
                    Leaderboards
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} LoL Stats.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
