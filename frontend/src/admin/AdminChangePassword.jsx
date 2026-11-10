import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  KeyRound,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import { adminChangePassword } from '../services/api'
import Reveal from '../components/ui/Reveal'

const RULES = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'Contains a letter', test: v => /[a-zA-Z]/.test(v) },
  { label: 'Contains a number', test: v => /\d/.test(v) },
]

export default function AdminChangePassword() {
  const nav = useNavigate()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const passed = RULES.filter(r => r.test(form.new_password)).length

  const submit = async e => {
    e.preventDefault()
    setMsg({ type: '', text: '' })

    if (!form.current_password || !form.new_password) {
      setMsg({ type: 'error', text: 'Please fill in your current and new password.' })
      return
    }
    if (form.new_password !== form.confirm_password) {
      setMsg({ type: 'error', text: 'The new passwords do not match.' })
      return
    }
    if (form.new_password.length < 8) {
      setMsg({ type: 'error', text: 'The new password must be at least 8 characters long.' })
      return
    }

    setLoading(true)
    try {
      const res = await adminChangePassword(form)
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Password updated.' })
        setForm({ current_password: '', new_password: '', confirm_password: '' })
      } else {
        setMsg({ type: 'error', text: res.message || 'Could not update the password.' })
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Could not reach the API. Is the backend running?',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-[13px] font-semibold text-ink-400 transition-colors hover:text-brand-600"
      >
        <ArrowLeft size={15} />
        Dashboard
      </Link>

      <Reveal>
        <div className="surface-solid overflow-hidden">
          <div className="flex items-start gap-4 border-b border-ink-100 bg-gradient-to-br from-ink-900 to-brand-800 p-7 text-white">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-accent-300">
              <KeyRound size={22} />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold text-white">Change password</h1>
              <p className="mt-1 text-[14px] text-ink-200">
                Update the password for the signed-in admin account.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="p-7">
            <div className="space-y-5">
              <div>
                <label className="label" htmlFor="current_password">
                  Current password
                </label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                  <input
                    id="current_password"
                    className="field pl-11"
                    type="password"
                    autoComplete="current-password"
                    value={form.current_password}
                    onChange={e => setForm({ ...form, current_password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="new_password">
                  New password
                </label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                  <input
                    id="new_password"
                    className="field pl-11 pr-11"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.new_password}
                    onChange={e => setForm({ ...form, new_password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                  {RULES.map((rule, i) => {
                    const ok = rule.test(form.new_password)
                    return (
                      <li
                        key={rule.label}
                        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors ${
                          ok ? 'text-emerald-600' : 'text-ink-400'
                        }`}
                      >
                        {ok ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <span className="h-[13px] w-[13px] rounded-full border border-ink-300" />
                        )}
                        {rule.label}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div>
                <label className="label" htmlFor="confirm_password">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                  <input
                    id="confirm_password"
                    className="field pl-11"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm_password}
                    onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                    required
                  />
                </div>
                {form.confirm_password && form.confirm_password !== form.new_password && (
                  <p className="mt-2 text-[12px] font-semibold text-red-600">Passwords do not match.</p>
                )}
              </div>
            </div>

            {msg.text && (
              <div
                className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-[14px] font-medium ${
                  msg.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {msg.type === 'success' ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                )}
                {msg.text}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-start gap-2 text-[12px] leading-relaxed text-ink-400">
                <Info size={14} className="mt-0.5 shrink-0" />
                Your session stays active. Other sessions are not affected.
              </p>
              <button type="submit" disabled={loading} className="btn-primary btn-md shrink-0">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <p className="text-[13px] leading-relaxed text-ink-500">
            Passwords are stored as bcrypt hashes and are never readable. After changing it, use the
            new password the next time you sign in.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
