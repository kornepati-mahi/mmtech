import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Inbox,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Loader2,
  X,
  Filter,
} from 'lucide-react'
import { adminMe, adminListEnquiries, adminUpdateEnquiryStatus } from '../services/api'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/ui/Reveal'

const STATUSES = ['New', 'Contacted', 'In Progress', 'Converted', 'Closed']

const STATUS_STYLES = {
  New: 'bg-brand-50 text-brand-700 border-brand-200',
  Contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-violet-50 text-violet-700 border-violet-200',
  Converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-ink-100 text-ink-500 border-ink-200',
}

export default function AdminEnquiries() {
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    try {
      await adminMe()
      const res = await adminListEnquiries()
      setItems(res.data || [])
    } catch (e) {
      nav('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(i => {
      const matchesStatus = filter === 'All' || i.status === filter
      const matchesQuery =
        !q ||
        [i.full_name, i.email, i.company_name, i.subject, i.service_interested]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      return matchesStatus && matchesQuery
    })
  }, [items, query, filter])

  const updateStatus = async (id, status) => {
    const prev = items.find(i => i.id === id)
    setSavingId(id)
    setMsg({ type: '', text: '' })
    try {
      const res = await adminUpdateEnquiryStatus({ id, status })
      if (res.success) {
        setItems(list => list.map(i => (i.id === id ? { ...i, status } : i)))
        setMsg({ type: 'success', text: `Status updated to “${status}”.` })
      } else {
        setMsg({ type: 'error', text: res.message || 'Update failed.' })
      }
    } catch (e) {
      setItems(list => list.map(i => (i.id === id ? { ...i, status: prev?.status } : i)))
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Update failed.' })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-ink-400 transition-colors hover:text-brand-600"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>
          <h1 className="display-2">Enquiries</h1>
          <p className="body-md mt-2">
            {loading ? 'Loading enquiries…' : `${filtered.length} of ${items.length} shown`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              className="field w-full pl-11 sm:w-72"
              placeholder="Search name, company, subject…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
            <select
              className="field appearance-none pl-11 pr-9"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              {['All', ...STATUSES].map(s => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All statuses' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {msg.text && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-[14px] font-medium ${
            msg.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          {msg.text}
          <button onClick={() => setMsg({ type: '', text: '' })} className="ml-auto opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="surface-solid grid place-items-center px-6 py-20">
          <Loader2 size={26} className="animate-spin text-brand-600" />
          <span className="mt-3 text-sm text-ink-400">Loading enquiries…</span>
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title={items.length ? 'No matching enquiries' : 'No enquiries yet'}
          text={
            items.length
              ? 'Try a different search term or status filter.'
              : 'Submit the public contact form to create the first enquiry.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.04, 0.3)}>
              <article className="surface-solid overflow-hidden transition-all duration-500 hover:shadow-md">
                <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
                        {String(item.full_name || '?').charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-[16px] font-bold text-ink-900">
                          {item.full_name}
                        </h2>
                        {item.company_name && (
                          <p className="truncate text-[13px] text-ink-400">{item.company_name}</p>
                        )}
                      </div>
                      <span
                        className={`ml-auto shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${
                          STATUS_STYLES[item.status] || STATUS_STYLES.New
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="mb-2 text-[15px] font-semibold text-ink-800">{item.subject}</h3>
                    <p className="body-md whitespace-pre-wrap text-[14px]">{item.message}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-400">
                      <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600">
                        <Mail size={14} />
                        {item.email}
                      </a>
                      <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600">
                        <Phone size={14} />
                        {item.phone}
                      </a>
                      {item.service_interested && (
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={14} />
                          {item.service_interested}
                        </span>
                      )}
                      <span>
                        Received {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full shrink-0 lg:w-52">
                    <label className="label">Update status</label>
                    <div className="relative">
                      <select
                        className="field appearance-none pr-9"
                        value={item.status}
                        disabled={savingId === item.id}
                        onChange={e => updateStatus(item.id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {savingId === item.id && (
                        <Loader2
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-600"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
