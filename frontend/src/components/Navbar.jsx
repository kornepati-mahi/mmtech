import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Phone, ArrowRight, ShieldCheck } from 'lucide-react'
import Logo from './ui/Logo'
import { useSiteSettings } from '../hooks/useSiteSettings'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Insights' },
  { to: '/testimonials', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
]

/** Routes whose hero is dark, so the header needs light text until it scrolls. */
const isDarkHeroRoute = pathname =>
  pathname === '/' || pathname.startsWith('/services/')

export default function Navbar() {
  const { phone } = useSiteSettings()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const overDarkHero = isDarkHeroRoute(location.pathname) && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          overDarkHero
            ? 'border-b border-white/10 bg-transparent'
            : 'border-b border-ink-100/80 bg-white/85 shadow-sm backdrop-blur-xl'
        }`}
      >
        <div className="shell">
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled ? 'h-[68px]' : 'h-[84px]'
            }`}
          >
            <Link to="/" aria-label="MM IT Tech Ltd home">
              <Logo light={overDarkHero} />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-2 text-[14px] font-semibold transition-colors duration-300 ${
                      overDarkHero
                        ? isActive
                          ? 'text-white'
                          : 'text-ink-300 hover:text-white'
                        : isActive
                          ? 'text-brand-700'
                          : 'text-ink-600 hover:text-ink-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className={`absolute inset-0 -z-10 rounded-full ${
                            overDarkHero ? 'bg-white/10' : 'bg-brand-50'
                          }`}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className={`hidden items-center gap-2 text-[13px] font-semibold transition-colors xl:inline-flex ${
                  overDarkHero ? 'text-ink-300 hover:text-white' : 'text-ink-500 hover:text-brand-600'
                }`}
              >
                <Phone size={15} />
                <span className="font-mono">{phone}</span>
              </a>
              <Link
                to="/admin/login"
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-all duration-300 ${
                  overDarkHero
                    ? 'border-white/20 bg-white/5 text-ink-200 hover:border-white/40 hover:bg-white/10 hover:text-white'
                    : 'border-ink-200 bg-white/70 text-ink-600 hover:border-brand-300 hover:bg-white hover:text-brand-700'
                }`}
              >
                <ShieldCheck size={15} />
                Admin
              </Link>
              <Link to="/contact" className="btn-primary btn-md">
                Get a Quote
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile trigger */}
            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className={`grid h-11 w-11 place-items-center rounded-2xl border backdrop-blur transition-colors lg:hidden ${
                overDarkHero
                  ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                  : 'border-ink-200 bg-white/70 text-ink-800 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="mx-4 mt-[92px] overflow-hidden rounded-3xl border border-white/60 bg-white/95 p-3 shadow-xl backdrop-blur-xl"
            >
              <nav className="flex flex-col">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.045 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition-colors ${
                          isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                        }`
                      }
                    >
                      {item.label}
                      <ArrowRight size={16} className="opacity-40" />
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-3 grid gap-2 border-t border-ink-100 pt-3">
                <Link to="/contact" className="btn-primary btn-md w-full">
                  Get a Quote
                  <ArrowRight size={16} />
                </Link>
                <Link to="/admin/login" className="btn-ghost btn-md w-full">
                  <ShieldCheck size={16} />
                  Admin sign in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
