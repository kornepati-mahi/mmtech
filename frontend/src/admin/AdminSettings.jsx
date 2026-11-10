import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Sparkles,
  Phone,
  MapPin,
  Mail,
  Megaphone,
  RotateCcw,
  Hash,
  MessageCircle,
} from 'lucide-react'
import { getSettings, adminUpdateSettings, invalidateCache } from '../services/api'
import { STAT_FIELDS, DEFAULT_STATS } from '../hooks/useSiteSettings'
import Reveal from '../components/ui/Reveal'

const BLANK = {
  company_name: '',
  company_description: '',
  contact_email: '',
  phone: '',
  address: '',
  hero_title: '',
  hero_description: '',
  cta_text: '',
  footer_text: '',
  whatsapp_number: '',
  site_stats: { ...DEFAULT_STATS },
}

export default function AdminSettings() {
  const [form, setForm] = useState(BLANK)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const load = async () => {
    try {
      const res = await getSettings()
      if (res && res.id) {
        const d = res
        let stats = { ...DEFAULT_STATS }
        try {
          const parsed = typeof d.site_stats === 'string' ? JSON.parse(d.site_stats) : d.site_stats
          if (parsed && typeof parsed === 'object') stats = { ...DEFAULT_STATS, ...parsed }
        } catch {
          /* keep defaults */
        }
        setForm({
          company_name: d.company_name || '',
          company_description: d.company_description || '',
          contact_email: d.contact_email || '',
          phone: d.phone || '',
          address: d.address || '',
          hero_title: d.hero_title || '',
          hero_description: d.hero_description || '',
          cta_text: d.cta_text || '',
          footer_text: d.footer_text || '',
          whatsapp_number: d.whatsapp_number || '',
          site_stats: stats,
        })
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Could not load settings.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const save = async e => {
    e.preventDefault()
    setMsg({ type: '', text: '' })

    if (!form.company_name.trim()) {
      setMsg({ type: 'error', text: 'Company name is required.' })
      return
    }
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      setMsg({ type: 'error', text: 'Please enter a valid contact email.' })
      return
    }

    setSaving(true)
    try {
      const res = await adminUpdateSettings(form)
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Settings saved' })
        invalidateCache('settings')
      } else {
        setMsg({ type: 'error', text: res.message || 'Save failed.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  const field = (key, label, { type = 'text', placeholder = '', rows = 0, required = false, icon: Icon = null } = {}) => (
    <div>
      <label className="label" htmlFor={`s-${key}`}>
        {label} {required && <span className="text-brand-600">*</span>}
      </label>
      {rows ? (
        <textarea
          id={`s-${key}`}
          className="field resize-y"
          rows={rows}
          value={form[key]}
          placeholder={placeholder}
          onChange={e => set(key, e.target.value)}
        />
      ) : (
        <div className="relative">
          {Icon && (
            <Icon
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300"
            />
          )}
          <input
            id={`s-${key}`}
            className={`field ${Icon ? 'pl-11' : ''}`}
            type={type}
            value={form[key]}
            placeholder={placeholder}
            onChange={e => set(key, e.target.value)}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow mb-4">
            <SettingsIcon size={13} />
            Configuration
          </span>
          <h1 className="display-2">Website settings</h1>
          <p className="body-md mt-2">
            These values feed the hero, contact details and footer across the whole site.
          </p>
        </div>

        <button
          onClick={() => {
            load()
            setMsg({ type: '', text: '' })
          }}
          disabled={loading}
          className="btn-ghost btn-md shrink-0"
        >
          <RotateCcw size={15} />
          Reset
        </button>
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
        </div>
      )}

      <form onSubmit={save}>
        {loading ? (
          <div className="surface-solid grid place-items-center px-6 py-20">
            <Loader2 size={26} className="animate-spin text-brand-600" />
            <span className="mt-3 text-sm text-ink-400">Loading settings…</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Company */}
            <Reveal>
              <section className="surface-solid overflow-hidden">
                <header className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-6 py-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Building2 size={17} />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-bold text-ink-900">Company</h2>
                    <p className="text-[13px] text-ink-400">Identity and public description</p>
                  </div>
                </header>
                <div className="grid gap-5 p-6">
                  {field('company_name', 'Company name', { required: true, placeholder: 'MM IT Tech Ltd' })}
                  {field('company_description', 'Company description', {
                    rows: 3,
                    placeholder: 'A premier technology and IT solutions provider…',
                  })}
                </div>
              </section>
            </Reveal>

            {/* Contact */}
            <Reveal delay={0.06}>
              <section className="surface-solid overflow-hidden">
                <header className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-6 py-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Phone size={17} />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-bold text-ink-900">Contact details</h2>
                    <p className="text-[13px] text-ink-400">Shown in the footer and on the contact page</p>
                  </div>
                </header>
                <div className="grid gap-5 p-6 sm:grid-cols-2">
                  {field('contact_email', 'Email address', {
                    type: 'email',
                    placeholder: 'info@mmittech.com',
                    icon: Mail,
                  })}
                  {field('phone', 'Phone', { placeholder: '+44 0000 000000', icon: Phone })}
                  <div className="sm:col-span-2">
                    {field('address', 'Address', { placeholder: 'London, United Kingdom', icon: MapPin })}
                  </div>
                  <div className="sm:col-span-2">
                    {field('whatsapp_number', 'WhatsApp number', {
                      placeholder: '447700900000',
                      icon: MessageCircle,
                    })}
                    <p className="mt-2 text-[12px] text-ink-400">
                      Digits only, with the country code and no spaces (e.g. 447700900000). Used to build
                      the WhatsApp chat links.
                    </p>
                  </div>
                </div>
              </section>
            </Reveal>

            {/* Hero */}
            <Reveal delay={0.12}>
              <section className="surface-solid overflow-hidden">
                <header className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-6 py-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Sparkles size={17} />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-bold text-ink-900">Homepage hero</h2>
                    <p className="text-[13px] text-ink-400">The headline, sub-copy and call to action</p>
                  </div>
                </header>
                <div className="grid gap-5 p-6">
                  {field('hero_title', 'Hero title', { placeholder: 'Powering Your Business with Smarter IT Solutions.' })}
                  {field('hero_description', 'Hero description', {
                    rows: 3,
                    placeholder: 'Reliable IT Support, Advanced Cloud Services…',
                  })}
                  {field('cta_text', 'Button label', { placeholder: 'Talk to Our Experts' })}
                </div>
              </section>
            </Reveal>

            {/* Footer */}
            <Reveal delay={0.18}>
              <section className="surface-solid overflow-hidden">
                <header className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-6 py-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Megaphone size={17} />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-bold text-ink-900">Footer</h2>
                    <p className="text-[13px] text-ink-400">Copyright line</p>
                  </div>
                </header>
                <div className="grid gap-5 p-6">
                  {field('footer_text', 'Footer text', { placeholder: '© MM IT Tech Ltd. All rights reserved.' })}
                </div>
              </section>
            </Reveal>

            {/* Key numbers */}
            <Reveal delay={0.24}>
              <section className="surface-solid overflow-hidden">
                <header className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-6 py-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Hash size={17} />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-bold text-ink-900">Key numbers</h2>
                    <p className="text-[13px] text-ink-400">
                      These update everywhere they appear on the site
                    </p>
                  </div>
                </header>
                <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  {STAT_FIELDS.map(s => (
                    <div key={s.key}>
                      <label className="label" htmlFor={`stat-${s.key}`}>
                        {s.label}
                      </label>
                      <input
                        id={`stat-${s.key}`}
                        className="field"
                        value={form.site_stats[s.key] ?? ''}
                        placeholder={DEFAULT_STATS[s.key]}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            site_stats: { ...prev.site_stats, [s.key]: e.target.value },
                          }))
                        }
                      />
                      <p className="mt-1.5 text-[11px] leading-snug text-ink-400">{s.hint}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            <div className="flex items-center justify-end gap-3 rounded-3xl border border-ink-100 bg-white px-6 py-4">
              <p className="mr-auto text-[13px] text-ink-400">
                Changes appear on the live site as soon as you save.
              </p>
              <button type="submit" disabled={saving} className="btn-primary btn-md shrink-0">
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
