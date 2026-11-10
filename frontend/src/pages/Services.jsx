import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Headset,
  Cloud,
  ShieldCheck,
  Server,
  Network,
  Database,
  Code2,
  LifeBuoy,
  ArrowRight,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import { getServices } from '../services/api'
import { useCachedData } from '../hooks/useCachedData'
import { FALLBACK_SERVICES, splitList } from '../data/fallback'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/ui/Reveal'
import { Section, SectionHeading } from '../components/ui/Section'

const ICONS = [Headset, Cloud, ShieldCheck, Server, Network, Database, Code2, LifeBuoy]
const GRADIENTS = [
  'from-brand-500 to-brand-400',
  'from-accent-500 to-accent-400',
  'from-violet-500 to-violet-400',
  'from-emerald-500 to-accent-400',
]

const FALLBACK = FALLBACK_SERVICES

export default function Services() {
  const [data, loaded] = useCachedData('services', getServices, { initial: FALLBACK_SERVICES })
  const [failed, setFailed] = useState(false)

  const services = data ?? FALLBACK_SERVICES

  // Fallback catalogue shows instantly; live data replaces it once the API answers.
  const list = services.length ? services : loaded ? [] : FALLBACK

  return (
    <div className="bg-ink-50">
      <PageHeader
        eyebrow="Services"
        title="Everything your IT estate needs, under one roof"
        subtitle="Managed support, cloud, security, infrastructure and consulting — designed to work together instead of competing for your attention."
      />

      <Section className="pt-16 sm:pt-20">
        <div className="shell">
          {failed && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
              <span className="font-semibold">Showing our standard catalogue —</span>
              <span>the live service list could not be reached from the API.</span>
            </div>
          )}

          {list.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((s, i) => {
                const Icon = ICONS[i % ICONS.length]
                const features = splitList(s.features)
                const benefits = splitList(s.benefits)
                return (
                  <Reveal key={s.id ?? s.slug} delay={(i % 3) * 0.08}>
                    <article className="surface-solid card-hover group relative flex h-full flex-col overflow-hidden p-7">
                      <div
                        className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} opacity-10 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-20`}
                      />
                      <div
                        className={`relative mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} text-white shadow-md transition-transform duration-500 group-hover:scale-110`}
                      >
                        <Icon size={24} />
                      </div>

                      <h2 className="relative mb-3 font-display text-xl font-bold leading-snug text-ink-900">
                        {s.name}
                      </h2>
                      <p className="relative body-md flex-1">{s.description}</p>

                      {features.length > 0 && (
                        <ul className="relative mt-6 space-y-2">
                          {features.map(f => (
                            <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink-600">
                              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      {benefits.length > 0 && (
                        <div className="relative mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-5">
                          {benefits.map(b => (
                            <span
                              key={b}
                              className="rounded-full bg-ink-50 px-3 py-1 text-[12px] font-semibold text-ink-600"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}

                      {s.slug && (
                        <Link
                          to={`/services/${s.slug}`}
                          className="relative mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-brand-600 transition-colors hover:text-brand-700"
                        >
                          View service details
                          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      )}
                    </article>
                  </Reveal>
                )
              })}
            </div>
          )}

          {!list.length && (
            <EmptyState
              title="No services published yet"
              text="Services added through the database and admin area appear here automatically."
              action={
                <Link to="/contact" className="btn-primary btn-md">
                  Get in touch
                  <ArrowRight size={16} />
                </Link>
              }
            />
          )}
        </div>
      </Section>

      {/* Capabilities */}
      <Section className="bg-white">
        <div className="shell">
          <SectionHeading
            eyebrow="Capabilities"
            title="Depth beyond the headline services"
            description="Engage us for a single service or let us run the entire estate end to end."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Layers, title: 'IT infrastructure', text: 'Servers, storage, virtualisation and end-user compute built for uptime.' },
              { icon: Network, title: 'Networking', text: 'Structured cabling, switching, Wi-Fi and secure site-to-site connectivity.' },
              { icon: Database, title: 'Data & backup', text: 'Immutable backups, tested restores and DR plans you can rely on.' },
              { icon: Code2, title: 'Applications', text: 'Business systems, integrations and custom tooling that stay maintainable.' },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className="group h-full rounded-3xl border border-ink-100 bg-ink-50/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-md">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-600 shadow-sm transition-colors duration-500 group-hover:bg-brand-gradient group-hover:text-white">
                    <c.icon size={20} />
                  </div>
                  <h3 className="mb-2 font-display text-[17px] font-bold text-ink-900">{c.title}</h3>
                  <p className="text-[14px] leading-relaxed text-ink-500">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-4xl bg-hero-gradient px-8 py-14 text-center text-white sm:px-14">
              <div className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-70" />
              <div className="glow-orb -left-16 -top-16 h-72 w-72 bg-brand-600/30" />
              <div className="glow-orb -bottom-20 -right-10 h-72 w-72 bg-accent-500/25" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="display-2 text-balance text-white">
                  Not sure which service you need?
                </h2>
                <p className="body-lg mt-5 text-pretty text-ink-200">
                  Book a free consultation. We will review your current setup and give you an honest,
                  prioritised plan — whether you work with us or not.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/contact" className="btn-primary btn-lg">
                    Book a free consultation
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/about" className="btn-ghost-dark btn-lg">
                    Learn about us
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  )
}
