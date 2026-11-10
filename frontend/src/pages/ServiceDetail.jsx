import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Headset,
  Cloud,
  ShieldCheck,
  Server,
  Network,
  Database,
  Code2,
  LifeBuoy,
  Sparkles,
  Clock,
  Gauge,
  Shield,
} from 'lucide-react'
import { getServices } from '../services/api'
import { useCachedData } from '../hooks/useCachedData'
import { FALLBACK_SERVICES, splitList } from '../data/fallback'
import Loader from '../components/Loader'
import Reveal from '../components/ui/Reveal'
import { Section, SectionHeading } from '../components/ui/Section'

const ICONS = [Headset, Cloud, ShieldCheck, Server, Network, Database, Code2, LifeBuoy]
const GRADIENTS = [
  'from-brand-500 to-brand-400',
  'from-accent-500 to-accent-400',
  'from-violet-500 to-violet-400',
  'from-emerald-500 to-accent-400',
]

const DELIVERY = [
  { icon: Clock, title: 'Fast onboarding', text: 'First engineers assigned and tooling ready within 48 hours of contract signature.' },
  { icon: Gauge, title: 'Measured SLAs', text: 'Every commitment is tracked with live reporting you can share with your own customers.' },
  { icon: Shield, title: 'Secure by default', text: 'Least-privilege access, encrypted tooling and full audit trails on every action.' },
]

export default function ServiceDetail() {
  const { slug } = useParams()
  const [data, loading] = useCachedData('services', getServices, { initial: FALLBACK_SERVICES })

  const services = data ?? FALLBACK_SERVICES

  const index = useMemo(
    () => services.findIndex(s => String(s.slug) === String(slug)),
    [services, slug]
  )
  const service = index >= 0 ? services[index] : null
  const related = useMemo(
    () => services.filter((_, i) => i !== index).slice(0, 3),
    [services, index]
  )

  if (loading) {
    return (
      <div className="shell-narrow py-32">
        <Loader text="Loading service…" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="shell-narrow py-32">
        <div className="surface-solid p-10 text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ink-50 text-ink-400">
            <Sparkles size={24} />
          </span>
          <h1 className="display-3 mb-2">Service not found</h1>
          <p className="body-md mb-8">The requested service could not be found or is no longer published.</p>
          <Link to="/services" className="btn-primary btn-md">
            <ArrowLeft size={16} />
            Back to services
          </Link>
        </div>
      </div>
    )
  }

  const Icon = ICONS[Math.max(index, 0) % ICONS.length]
  const gradient = GRADIENTS[Math.max(index, 0) % GRADIENTS.length]
  const features = splitList(service.features)
  const benefits = splitList(service.benefits)

  return (
    <div className="bg-ink-50">
      {/* Service hero */}
      <section className="relative overflow-hidden bg-hero-gradient pb-20 pt-32 text-white sm:pb-24 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 grid-overlay-dark" />
        <div className="glow-orb -right-20 -top-20 h-96 w-96 bg-brand-600/30" />
        <div className="glow-orb -left-24 bottom-0 h-80 w-80 bg-accent-500/20" />

        <div className="shell relative">
          <Link
            to="/services"
            className="mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-ink-300 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} />
            All services
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Reveal>
              <span className={`grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                <Icon size={30} />
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="display-2 text-balance text-white">{service.name}</h1>
              <p className="body-lg mt-4 max-w-2xl text-pretty text-ink-200">{service.description}</p>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="btn-primary btn-lg">
                Request a proposal
                <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="btn-ghost-dark btn-lg">
                Compare services
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <Section className="pt-16 sm:pt-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div>
            <SectionHeading
              align="left"
              eyebrow="What's included"
              title="Capabilities your team can rely on"
              description="Every engagement is scoped in writing so there are no surprises on the invoice."
              className="sm:max-w-xl"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {(features.length
                ? features
                : ['Discovery and assessment', 'Implementation and handover', 'Ongoing monitoring', 'Documentation']
              ).map((f, i) => (
                <Reveal key={f} delay={i * 0.05}>
                  <div className="group flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors duration-500 group-hover:bg-brand-gradient group-hover:text-white">
                      <CheckCircle2 size={15} />
                    </span>
                    <span className="text-[14px] font-semibold leading-relaxed text-ink-700">{f}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.12}>
            <div className="surface-solid overflow-hidden">
              <div className="bg-ink-900 px-7 py-5">
                <h2 className="font-display text-lg font-bold text-white">Business benefits</h2>
              </div>
              <ul className="divide-y divide-ink-100">
                {(benefits.length ? benefits : ['Reduced downtime', 'Improved productivity']).map(b => (
                  <li key={b} className="flex items-center gap-3 px-7 py-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="text-[14px] font-semibold text-ink-700">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-ink-50 px-7 py-6">
                <p className="text-[13px] leading-relaxed text-ink-500">
                  Need something not listed? We tailor every engagement around your environment.
                </p>
                <Link to="/contact" className="btn-link mt-4 text-[14px]">
                  Talk to an engineer
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Delivery */}
      <Section dark className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-60" />
        <div className="glow-orb right-0 top-0 h-80 w-80 bg-brand-600/25" />
        <div className="shell relative">
          <SectionHeading
            dark
            eyebrow="How we deliver"
            title="A delivery model built around your uptime"
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {DELIVERY.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent-400/30 hover:bg-white/[0.07]">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 text-accent-300">
                    <d.icon size={22} />
                  </div>
                  <h3 className="mb-2 font-display text-[17px] font-bold text-white">{d.title}</h3>
                  <p className="text-[14px] leading-relaxed text-ink-300">{d.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section>
          <div className="shell">
            <SectionHeading eyebrow="Keep exploring" title="Related services" />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {related.map((s, i) => {
                const RIcon = ICONS[i % ICONS.length]
                return (
                  <Reveal key={s.id ?? s.slug} delay={i * 0.07}>
                    <Link
                      to={`/services/${s.slug}`}
                      className="surface-solid card-hover group flex h-full flex-col p-6"
                    >
                      <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-500 group-hover:bg-brand-gradient group-hover:text-white">
                        <RIcon size={20} />
                      </span>
                      <h3 className="mb-2 font-display text-[17px] font-bold text-ink-900">{s.name}</h3>
                      <p className="body-md flex-1 line-clamp-2">{s.description}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-brand-600">
                        View service
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </Section>
      )}
    </div>
  )
}
