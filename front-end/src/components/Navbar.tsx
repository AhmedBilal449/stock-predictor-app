import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Sun, Moon, LayoutDashboard, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]

export default function Navbar() {
  const location = useLocation()
  const [isDark, setIsDark] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-lg shadow-lg shadow-black/20'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-200 group-hover:scale-105">
            <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-slate-100 tracking-tight">
            Stock<span className="text-indigo-400">Sight</span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                location.pathname === to
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors duration-150"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            to="/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-medium transition-all duration-150 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            Start Predicting
          </Link>
        </div>
      </div>
    </header>
  )
}
