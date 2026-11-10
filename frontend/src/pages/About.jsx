import { Link } from 'react-router-dom'
import {
  Target,
  Eye,
  Compass,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CalendarDays,
  Lightbulb,
  Handshake,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/ui/Reveal'
import { Section, SectionHeading } from '../components/ui/Section'
import { useSiteSettings, DEFAULT_STATS } from '../hooks/useSiteSettings'

const PRINCIPLES = [
  {
    icon: Target,
    title: 'Our mission',
    text: 'To minimise downtime and maximise productivity through proactive IT support and secure, well-engineered technology.',
    accent: 'from-brand-500 to-accent-400',
  },
  {
    icon: Eye,
    title: 'Our vision',
    text: 'To be the trusted technology partner that lets ambitious businesses grow with confidence, wherever they operate.',
    accent: 'from-violet-500 to-brand-500',
  },
  {
    icon: Compass,
    title: 'Our values',
    text: 'Reliability and accountability, a security-first mindset, clear communication and relentless continuous improvement.',
    accent: 'from-accent-500 to-emerald-400',
  },
]

const VALUES = [
  { icon: ShieldCheck, title: 'Security first', text: 'Every recommendation is filtered through a security lens before it reaches your business.' },
  { icon: MessageSquare, title: 'Clear communication', text: 'Plain English, honest trade-offs and a named contact who actually knows your estate.' },
  { icon: Sparkles, title: 'Continuous improvement', text: 'Quarterly reviews, proactive tuning and documented learnings baked into every engagement.' },
  { icon: Handshake, title: 'Partnership', text: 'We act as an extension of your team, not a vendor you call when something breaks.' },
]

const TIMELINE = [
  {
    badge: '2010',
    title: 'Founded in London',
    text: 'MM IT Tech Ltd starts as a two-engineer consultancy supporting SMEs across the UK.',
  },
  {
    badge: '2014',
    title: 'Managed services launch',
    text: '24/7 monitoring and proactive support become the core of the business.',
  },
  {
    badge: '2018',
    title: 'Cloud practice',
    text: 'Migration and optimisation practices open for hybrid and multi-cloud estates.',
  },
  {
    badge: '2021',
    title: 'Security & compliance',
    text: 'A dedicated cyber team delivers audits, threat monitoring and compliance support.',
  },
  {
    badge: 'Now',
    title: '250+ business clients',
    text: 'A team of 40 engineers supporting thousands of endpoints around the clock.',
  },
]

export default function About() {
  const { stats } = useSiteSettings()

  return (
    <div className="bg-ink-50">
      <PageHeader
        eyebrow="About us"
        title="Technology that quietly works behind your business"
        subtitle="MM IT Tech Ltd is a technology and IT solutions provider dedicated to delivering reliable, scalable and secure IT infrastructure for modern businesses."
      />

      {/* Story */}
      <Section className="pt-16 sm:pt-20">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow mb-5">
              <Lightbulb size={13} />
              Our story
            </span>
            <h2 className="display-2 text-balance">
              Built on <span className="text-gradient">reliability</span>, not revenue
            </h2>
            <p className="body-lg mt-6 text-pretty">
              We started MM IT Tech Ltd after years of watching good businesses lose productive hours
              to avoidable outages, missed backups and poorly managed vendors. Our founding principle was
              simple: make IT boringly predictable.
            </p>
            <p className="body-lg mt-4 text-pretty">
              Today we operate as an extension of our clients’ teams — designing, securing and operating
              the platforms their businesses depend on, whether that is a five-person studio or a
              multi-site enterprise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary btn-md">
                Work with us
                <ArrowRight size={16} />
              </Link>
              <Link to="/services" className="btn-ghost btn-md">
                Our services
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-200/40 to-accent-200/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['engineers', 'Engineers & consultants'],
                    ['clients', 'Business clients'],
                    ['secured', 'Endpoints secured'],
                    ['uptime', 'SLA upheld'],
                  ].map(([key, label]) => (
                    <div key={label} className="rounded-2xl border border-ink-100 bg-ink-50/70 p-5">
                      <p className="font-display text-2xl font-extrabold text-ink-900">
                        {stats[key] ?? DEFAULT_STATS[key]}
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-ink-500">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-4 rounded-2xl bg-ink-900 p-5 text-white">
                  <CalendarDays size={22} className="shrink-0 text-accent-400" />
                  <p className="text-[14px] leading-relaxed text-ink-200">
                    Operating since <span className="font-bold text-white">2010</span> — one of the
                    longest-running independent IT consultancies in the region.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Mission / Vision / Values */}
      <Section className="bg-white">
        <div className="shell">
          <SectionHeading
            eyebrow="Mission & vision"
            title="The principles behind every engagement"
            description="Our strategy is simple — protect uptime, strengthen security and keep technology aligned with commercial goals."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="surface-solid card-hover group relative h-full overflow-hidden p-7">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${p.accent} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div className="mb-5 grid h-[52px] w-[52px] place-items-center rounded-2xl bg-ink-50 text-brand-600 transition-transform duration-500 group-hover:scale-110">
                    <p.icon size={22} />
                  </div>
                  <h3 className="mb-3 font-display text-xl font-bold text-ink-900">{p.title}</h3>
                  <p className="body-md">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Values detail */}
      <Section>
        <div className="shell">
          <SectionHeading
            eyebrow="How we operate"
            title="Values you can hold us to"
            description="These four ideas shape how we price, deliver and support every account."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="group h-full rounded-3xl border border-ink-100 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-500 group-hover:bg-brand-gradient group-hover:text-white">
                    <v.icon size={20} />
                  </div>
                  <h3 className="mb-2 font-display text-[17px] font-bold text-ink-900">{v.title}</h3>
                  <p className="text-[14px] leading-relaxed text-ink-500">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Timeline */}
      <Section dark className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-60" />
        <div className="glow-orb -left-24 top-10 h-80 w-80 bg-brand-600/25" />
        <div className="glow-orb right-0 bottom-0 h-96 w-96 bg-violet-500/20" />

        <div className="shell relative">
          <SectionHeading
            dark
            eyebrow="Our journey"
            title="From a two-person consultancy to a full-service IT partner"
            description="Fifteen years of steady, deliberate growth — built on long-term client relationships rather than acquisition."
          />

          <div className="relative mt-16">
            {/* Desktop spine */}
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-[23px] hidden h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent lg:block" />

            <ol className="grid gap-12 lg:grid-cols-5 lg:gap-6">
              {TIMELINE.map((t, i) => (
                <Reveal as="li" key={t.badge} delay={i * 0.08} className="relative flex gap-5 lg:block">
                  {/* Mobile spine */}
                  {i < TIMELINE.length - 1 && (
                    <span className="absolute left-[21px] top-12 bottom-[-48px] w-px bg-gradient-to-b from-accent-400/45 to-transparent lg:hidden" />
                  )}

                  {/* Node */}
                  <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent-400/40 bg-ink-900 font-mono text-[11px] font-bold text-accent-300 shadow-[0_0_0_7px_rgba(7,11,24,1)] lg:mx-auto lg:h-12 lg:w-12 lg:text-[12px]">
                    {t.badge}
                  </span>

                  {/* Card */}
                  <div className="group min-w-0 flex-1 lg:mt-7 lg:h-full lg:text-center">
                    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-accent-400/30 group-hover:bg-white/[0.06]">
                      <h3 className="mb-2 font-display text-[17px] font-bold leading-snug text-white">
                        {t.title}
                      </h3>
                      <p className="text-[14px] leading-relaxed text-ink-300">{t.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </div>
  )
}
