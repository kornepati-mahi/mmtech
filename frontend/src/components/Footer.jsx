import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ArrowUpRight, Github, Linkedin, Twitter } from 'lucide-react'
import Logo from './ui/Logo'
import Reveal from './ui/Reveal'
import { useSiteSettings } from '../hooks/useSiteSettings'

const COMPANY = [
  { to: '/about', label: 'About us' },
  { to: '/services', label: 'Services' },
  { to: '/blog', label: 'Insights' },
  { to: '/testimonials', label: 'Client reviews' },
  { to: '/contact', label: 'Contact' },
]

const SERVICES = [
  { to: '/services/managed-it-support', label: 'Managed IT support' },
  { to: '/services/cloud-services', label: 'Cloud services' },
  { to: '/services/cybersecurity', label: 'Cybersecurity' },
  { to: '/contact', label: 'IT consulting' },
]

const SOCIALS = [
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const { settings, phone, email, address, companyName } = useSiteSettings()

  const description =
    settings?.company_description ||
    'A premier technology and IT solutions provider delivering reliable, scalable and secure IT infrastructure for modern businesses.'
  const copyright = settings?.footer_text || `© ${year} ${companyName}. All rights reserved.`

  return (
    <footer className="relative overflow-hidden bg-ink-900 text-white">
      <div className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-70" />
      <div className="glow-orb -left-24 top-0 h-80 w-80 bg-brand-600/30" />
      <div className="glow-orb -right-20 bottom-0 h-96 w-96 bg-accent-500/20" />

      <div className="shell relative py-16 sm:py-20">
        {/* CTA strip */}
        <Reveal className="mb-14 grid gap-6 rounded-4xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:grid-cols-2 md:items-center md:p-10">
          <div>
            <h2 className="display-3 text-white">
              Ready to upgrade your <span className="text-gradient-dark">IT infrastructure?</span>
            </h2>
            <p className="body-md mt-3 text-ink-300">
              Talk to our engineers about managed support, cloud and security for your business.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link to="/contact" className="btn-primary btn-lg">
              Book a consultation
              <ArrowUpRight size={18} />
            </Link>
            <a href="tel:+440000000000" className="btn-ghost-dark btn-lg">
              <Phone size={17} />
              Call us
            </a>
          </div>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo subtitle="Smarter IT Solutions" light />
            <p className="body-md mt-5 max-w-sm text-ink-300">{description}</p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-400/40 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-white">Company</h3>
            <ul className="space-y-2.5">
              {COMPANY.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[14px] text-ink-300 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-white">Services</h3>
            <ul className="space-y-2.5">
              {SERVICES.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[14px] text-ink-300 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-white">Get in touch</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-accent-300">
                  <Mail size={16} />
                </span>
                <span className="text-[14px] text-ink-300">
                  <a href={`mailto:${email}`} className="transition-colors hover:text-white">
                    {email}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-accent-300">
                  <Phone size={16} />
                </span>
                <span className="text-[14px] text-ink-300">
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="transition-colors hover:text-white"
                  >
                    {phone}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-accent-300">
                  <MapPin size={16} />
                </span>
                <span className="text-[14px] text-ink-300">{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-[13px] text-ink-400">{copyright}</p>
          <div className="flex items-center gap-5">
            <Link to="/admin/login" className="text-[13px] font-semibold text-ink-400 transition-colors hover:text-white">
              Admin portal
            </Link>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-[13px] text-ink-400">Privacy · Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
