import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { submitContact } from '../services/api'
import { useSiteSettings } from '../hooks/useSiteSettings'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'

const INITIAL = {
  full_name: '',
  email: '',
  phone: '',
  company_name: '',
  service_interested: '',
  subject: '',
  message: '',
}

const SERVICE_OPTIONS = [
  'Managed IT Support',
  'Cloud Services & Cloud Migration',
  'Cybersecurity Solutions',
  'IT Consulting',
  'Something else',
]

const CONTACT_CHANNELS = [
  { icon: Mail, label: 'Email us', key: 'email' },
  { icon: Phone, label: 'Call us', key: 'phone' },
  { icon: MapPin, label: 'Visit us', key: 'address' },
  { icon: Clock, label: 'Response time', value: 'Within 1 business hour' },
]

export default function Contact() {
  const { settings, phone, email, address, companyName } = useSiteSettings()
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async e => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    const required = ['full_name', 'email', 'phone', 'subject', 'message']
    if (required.some(k => !String(form[k]).trim())) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }
    if (String(form.phone).replace(/\D/g, '').length < 7) {
      setStatus({ type: 'error', message: 'Please enter a valid phone number.' })
      return
    }

    setLoading(true)
    try {
      const res = await submitContact(form)
      if (res.success) {
        setStatus({ type: 'success', message: res.message || 'Enquiry submitted successfully.' })
        setForm(INITIAL)
      } else {
        setStatus({ type: 'error', message: res.message || 'Submission failed.' })
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Could not submit enquiry. Check the API connection.',
      })
    } finally {
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text', required = false, placeholder = '') => (
    <div>
      <label className="label" htmlFor={name}>
        {label} {required && <span className="text-brand-600">*</span>}
      </label>
      <input
        id={name}
        className="field"
        type={type}
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="bg-ink-50">
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you need — we'll do the rest"
        subtitle="Send an enquiry and a senior engineer will get back to you within one business hour with a clear next step."
      />

      <Section className="pt-14 sm:pt-16">
        <div className="shell grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          {/* Form */}
          <Reveal>
            <form onSubmit={onSubmit} className="surface-solid p-7 sm:p-9">
              <div className="mb-8 flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                  <MessageSquare size={22} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-900">Send your enquiry</h2>
                  <p className="text-[14px] text-ink-500">
                    Fields marked <span className="text-brand-600">*</span> are required.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {field('full_name', 'Full name', 'text', true, 'Alex Morgan')}
                {field('email', 'Email address', 'email', true, 'alex@company.com')}
                {field('phone', 'Phone number', 'tel', true, '+44 7700 900000')}
                {field('company_name', 'Company', 'text', false, 'Company Ltd')}
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="service_interested">
                    Service required
                  </label>
                  <select
                    id="service_interested"
                    className="field appearance-none"
                    name="service_interested"
                    value={form.service_interested}
                    onChange={onChange}
                  >
                    <option value="">Select a service</option>
                    {SERVICE_OPTIONS.map(o => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                {field('subject', 'Subject', 'text', true, 'How can we help?')}
              </div>

              <div className="mt-5">
                <label className="label" htmlFor="message">
                  Message <span className="text-brand-600">*</span>
                </label>
                <textarea
                  id="message"
                  className="field resize-y"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={onChange}
                  placeholder="Tell us about your environment, what is not working, and what good looks like…"
                />
              </div>

              {status.message && (
                <div
                  role="status"
                  className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-[14px] ${
                    status.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  )}
                  <span className="font-medium">{status.message}</span>
                </div>
              )}

              <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <p className="text-[12px] leading-relaxed text-ink-400">
                  By submitting you agree to our privacy policy. We never share your details.
                </p>
                <button type="submit" disabled={loading} className="btn-primary btn-lg w-full shrink-0 sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send enquiry
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>

          {/* Side panel */}
          <div className="space-y-6">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8 text-white">
                <div className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-70" />
                <div className="glow-orb -right-12 -top-12 h-52 w-52 bg-brand-600/35" />
                <div className="relative">
                  <span className="eyebrow-dark mb-5">
                    <Sparkles size={13} />
                    Talk to us today
                  </span>
                  <h2 className="display-3 mb-3 text-white">Prefer a conversation?</h2>
                  <p className="mb-7 text-[15px] leading-relaxed text-ink-200">
                    Book a 30-minute discovery call. We will map your current setup and outline the
                    fastest route to less downtime.
                  </p>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-primary btn-md mb-3 w-full">
                    <Phone size={16} />
                    {phone}
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="btn-ghost-dark btn-md w-full"
                  >
                    <Mail size={16} />
                    {email}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="surface-solid divide-y divide-ink-100 overflow-hidden">
                {CONTACT_CHANNELS.map(({ icon: Icon, label, key, value }) => {
                  const channelValue =
                    key === 'email' ? email : key === 'phone' ? phone : key === 'address' ? address : value
                  const href =
                    key === 'email'
                      ? `mailto:${email}`
                      : key === 'phone'
                        ? `tel:${phone.replace(/\s/g, '')}`
                        : null
                  const inner = (
                    <>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-500 group-hover:bg-brand-gradient group-hover:text-white">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12px] font-semibold uppercase tracking-wider text-ink-400">
                          {label}
                        </span>
                        <span className="block truncate text-[14px] font-semibold text-ink-800">
                          {channelValue}
                        </span>
                      </span>
                    </>
                  )
                  return href ? (
                    <a
                      key={label}
                      href={href}
                      className="group flex items-center gap-4 p-5 transition-colors hover:bg-ink-50"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={label} className="group flex items-center gap-4 p-5">
                      {inner}
                    </div>
                  )
                })}
              </div>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="surface-solid flex items-start gap-4 p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h3 className="mb-1 font-display text-[15px] font-bold text-ink-900">
                    Your data stays yours
                  </h3>
                  <p className="text-[14px] leading-relaxed text-ink-500">
                    Enquiries are stored securely in our own database and are only visible to the team
                    handling your request.
                  </p>
                  <Link to="/services" className="btn-link mt-3 text-[13px]">
                    Explore our services
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  )
}
