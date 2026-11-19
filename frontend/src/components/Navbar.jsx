import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/eda', label: 'EDA' },
  { to: '/pca', label: 'PCA' },
  { to: '/report', label: 'Model Report' },
]

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-slate-800"
      style={{ backgroundColor: '#0f172a' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-2xl select-none">🌸</span>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Iris Classifier
            </span>
          </NavLink>

          {/* Nav links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
