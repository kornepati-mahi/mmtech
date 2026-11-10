import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Inbox,
  Sparkles,
  FileText,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  CircleDot,
} from 'lucide-react'
import { adminMe, adminListEnquiries, getBlogs, getServices } from '../services/api'
import Loader from '../components/Loader'
import Reveal from '../components/ui/Reveal'

const STATUS_COLORS = {
  New: 'bg-brand-50 text-brand-700 border-brand-200',
  Contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-violet-50 text-violet-700 border-violet-200',
  Converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-ink-100 text-ink-500 border-ink-200',
}

export default function AdminDashboard() {
  const nav = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [stats, setStats] = useState({ enquiries: 0, newEnquiries: 0, blogs: 0, services: 0 })
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const me = await adminMe()
        if (!me.success) throw new Error('Unauthorized')
        setAdmin(me.admin)

        const [enq, blogs, services] = await Promise.allSettled([
          adminListEnquiries(),
          getBlogs(),
          getServices(),
        ])
        const list = enq.status === 'fulfilled' && enq.value.success ? enq.value.data || [] : []
        setEnquiries(list)
        setStats({
          enquiries: list.length,
          newEnquiries: list.filter(e => e.status === 'New').length,
          blogs: blogs.status === 'fulfilled' ? (blogs.value || []).length : 0,
          services: services.status === 'fulfilled' ? (services.value || []).length : 0,
        })
      } catch (e) {
        setError('Session expired or unauthorized.')
        nav('/admin/login')
      } finally {
        setLoading(false)
      }
    })()
  }, [nav])

  const recent = useMemo(
    () =>
      [...enquiries]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5),
    [enquiries]
  )

  const breakdown = useMemo(() => {
    const counts = {}
    enquiries.forEach(e => {
      counts[e.status] = (counts[e.status] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [enquiries])

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader text="Loading dashboard…" />
      </div>
    )
  }

  const cards = [
    { label: 'Total enquiries', value: stats.enquiries, icon: Inbox, tone: 'from-brand-500 to-brand-400' },
    { label: 'New enquiries', value: stats.newEnquiries, icon: Sparkles, tone: 'from-accent-500 to-accent-400' },
    { label: 'Published blogs', value: stats.blogs, icon: FileText, tone: 'from-violet-500 to-violet-400' },
    { label: 'Active services', value: stats.services, icon: Layers, tone: 'from-emerald-500 to-accent-400' },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow mb-4">
            <Activity size={13} />
            Live overview
          </span>
          <h1 className="display-2">
            Welcome back{admin ? `, ${admin.name.split(' ')[0]}` : ''}
          </h1>
          <p className="body-md mt-2">Here is how your website enquiry pipeline looks today.</p>
        </div>
        <Link to="/admin/enquiries" className="btn-primary btn-md shrink-0">
          Manage enquiries
          <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.06}>
            <div className="surface-solid group relative overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.tone} opacity-15 blur-xl transition-transform duration-700 group-hover:scale-150`}
              />
              <span className={`relative mb-5 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.tone} text-white shadow-md`}>
                <c.icon size={20} />
              </span>
              <p className="relative font-display text-3xl font-extrabold tracking-tight text-ink-900">{c.value}</p>
              <p className="relative mt-1 text-[13px] font-medium text-ink-500">{c.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Recent enquiries */}
        <Reveal delay={0.1}>
          <div className="surface-solid h-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
              <div>
                <h2 className="font-display text-[17px] font-bold text-ink-900">Recent enquiries</h2>
                <p className="text-[13px] text-ink-400">Latest submissions from the contact form</p>
              </div>
              <Link to="/admin/enquiries" className="btn-link text-[13px]">
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            {recent.length ? (
              <ul className="divide-y divide-ink-100">
                {recent.map(item => (
                  <li key={item.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-ink-50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
                      {String(item.full_name || '?').charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink-900">{item.full_name}</p>
                      <p className="truncate text-[13px] text-ink-400">{item.subject}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${
                        STATUS_COLORS[item.status] || STATUS_COLORS.New
                      }`}
                    >
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-14 text-center">
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ink-50 text-ink-400">
                  <Inbox size={22} />
                </span>
                <p className="text-[14px] font-medium text-ink-500">No enquiries yet.</p>
                <p className="mt-1 text-[13px] text-ink-400">
                  Submit the public contact form to see it appear here.
                </p>
              </div>
            )}
          </div>
        </Reveal>

        {/* Pipeline */}
        <Reveal delay={0.16}>
          <div className="surface-solid h-full p-6">
            <div className="mb-6">
              <h2 className="font-display text-[17px] font-bold text-ink-900">Pipeline</h2>
              <p className="text-[13px] text-ink-400">Enquiries by current status</p>
            </div>

            {breakdown.length ? (
              <ul className="space-y-4">
                {breakdown.map(([status, count]) => {
                  const pct = Math.round((count / (stats.enquiries || 1)) * 100)
                  return (
                    <li key={status}>
                      <div className="mb-1.5 flex items-center justify-between text-[13px]">
                        <span className="inline-flex items-center gap-2 font-semibold text-ink-700">
                          <CircleDot size={13} className="text-brand-500" />
                          {status}
                        </span>
                        <span className="font-mono font-bold text-ink-900">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-brand-gradient"
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="grid h-48 place-items-center text-center">
                <div>
                  <TrendingUp size={26} className="mx-auto mb-3 text-ink-300" />
                  <p className="text-[14px] text-ink-400">No pipeline data yet.</p>
                </div>
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-ink-100 bg-ink-50 p-5">
              <p className="text-[13px] leading-relaxed text-ink-500">
                <strong className="text-ink-700">Coming next:</strong> blog, service and testimonial
                management plus settings editing are staged on this console structure.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
