import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Inbox,
  Settings,
  FileText,
  Layers,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  MessageSquareQuote,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import { adminLogout } from '../services/api'

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { to: '/admin/blog', label: 'Blog posts', icon: FileText },
  { to: '/admin/services', label: 'Services', icon: Layers },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="px-6 py-6" onClick={onNavigate}>
        <span className="[&_span]:!text-white">
          <Logo subtitle="Admin console" light />
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {ADMIN_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-all duration-300 ${
                item.disabled
                  ? 'cursor-not-allowed text-ink-500 opacity-50'
                  : isActive
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-white' : 'text-ink-400 group-hover:text-white'} />
                <span className="flex-1">{item.label}</span>
                {item.disabled && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Soon
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] font-semibold text-ink-400">
        <ShieldCheck size={15} className="shrink-0 text-emerald-400" />
        Secure session
      </div>

      <Link
        to="/"
        className="mx-3 mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold text-ink-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ExternalLink size={18} className="text-ink-400" />
        View live website
      </Link>
    </div>
  )
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [navKey, setNavKey] = useState(0)
  const nav = useNavigate()
  const location = useLocation()

  // Always start a new admin page from the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname, navKey])

  // Any sidebar click remounts the page, clearing open editors and filters.
  const handleNavigate = () => {
    setOpen(false)
    setNavKey(k => k + 1)
  }

  const logout = async () => {
    try {
      await adminLogout()
    } finally {
      nav('/admin/login')
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col bg-ink-900 lg:flex">
        <SidebarContent onNavigate={handleNavigate} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              onClick={e => e.stopPropagation()}
              className="h-full w-[280px] bg-ink-900"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-6 grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-ink-300"
              >
                <X size={17} />
              </button>
              <SidebarContent onNavigate={handleNavigate} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[70px] items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 text-ink-700 lg:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="font-display text-[15px] font-bold text-ink-900">Admin console</p>
                <p className="text-[12px] text-ink-400">MM IT Tech Ltd</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/admin/password"
                className="btn-ghost btn-sm"
                title="Change your password"
              >
                <KeyRound size={15} />
                <span className="hidden sm:inline">Password</span>
              </Link>
              <button onClick={logout} className="btn-ghost btn-sm">
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <Outlet key={`${location.pathname}-${navKey}`} />
        </main>
      </div>
    </div>
  )
}
