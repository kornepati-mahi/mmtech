import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { adminLogin } from '../services/api'
import Logo from '../components/ui/Logo'

const HIGHLIGHTS = [
  'Review and triage every website enquiry',
  'Track service interest and conversion status',
  'Keep a full audit trail of every update',
]

export default function AdminLogin() {
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email address and password.')
      return
    }

    setLoading(true)
    try {
      const res = await adminLogin(form)
      if (res.success) nav('/admin/dashboard')
      else setError(res.message || 'Invalid credentials')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Could not reach the API. Make sure the PHP backend is running on port 8000.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col bg-white px-6 py-8 sm:px-12 lg:px-16 lg:py-12">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-ink-400 transition-colors hover:text-brand-600">
          <ArrowLeft size={15} />
          Back to website
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <div className="mb-9">
              <span className="mb-7 inline-block lg:hidden">
                <Logo />
              </span>
              <h1 className="display-2 mb-2">Welcome back</h1>
              <p className="body-md">Sign in to manage enquiries and website content.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                  <input
                    id="email"
                    className="field pl-11"
                    type="email"
                    autoComplete="username"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                  <input
                    id="password"
                    className="field pl-11 pr-11"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

          </motion.div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-hero-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 grid-overlay-dark" />
        <div className="glow-orb -right-20 top-10 h-[380px] w-[380px] bg-brand-600/35 animate-float" />
        <div className="glow-orb -left-20 bottom-10 h-[340px] w-[340px] bg-accent-500/25 animate-drift" />

        <div className="relative">
          <Logo subtitle="Admin console" light />
        </div>

        <div className="relative max-w-md">
          <h2 className="display-2 text-balance text-white">
            Keep every <span className="text-gradient-dark">enquiry</span> moving forward
          </h2>
          <p className="body-lg mt-5 text-pretty text-ink-200">
            One console for every message, service request and status change across the website.
          </p>

          <ul className="mt-9 space-y-3.5">
            {HIGHLIGHTS.map(h => (
              <li key={h} className="flex items-center gap-3 text-[15px] text-ink-200">
                <CheckCircle2 size={18} className="shrink-0 text-accent-400" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-[13px] text-ink-400">
          <ShieldCheck size={16} className="text-accent-400" />
          Secured by server-side PHP sessions
        </div>
      </div>
    </div>
  )
}
