import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, ChevronRight, Headset, Cloud, ShieldCheck, Server, Loader2 } from 'lucide-react'
import { getServices } from '../services/api'
import { useCachedData } from '../hooks/useCachedData'
import { useSiteSettings } from '../hooks/useSiteSettings'

const ICONS = [Headset, Cloud, ShieldCheck, Server]

const buildMessage = (companyName, serviceName) =>
  `Hi ${companyName}, I'm interested in ${serviceName}. Could we book a quick consultation?`

export default function WhatsAppWidget() {
  const { whatsappNumber, companyName } = useSiteSettings()
  const [services, loading] = useCachedData('services', getServices)
  const [showList, setShowList] = useState(false)
  const closeTimer = useRef(null)

  const items = services || []

  const openList = () => {    clearTimeout(closeTimer.current)
    setShowList(true)
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setShowList(false), 220)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  if (!whatsappNumber) return null

  const waLink = serviceName =>
    `https://wa.me/${String(whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(
      buildMessage(companyName, serviceName)
    )}`

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3"
      onMouseEnter={openList}
      onMouseLeave={scheduleClose}
    >
      {/* Service list panel */}
      <div
        className={`w-[min(20rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-2xl transition-all duration-300 ease-spring ${
          showList
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-ink-50 px-5 py-4">
          <div>
            <p className="font-display text-[15px] font-bold text-ink-900">Chat on WhatsApp</p>
            <p className="text-[12px] text-ink-500">Pick a service — we will pre-fill your message</p>
          </div>
          <button
            onClick={() => setShowList(false)}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[19rem] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-ink-400">
              <Loader2 size={15} className="animate-spin" />
              Loading services…
            </div>
          )}

          {!loading && items.length === 0 && (
            <p className="px-3 py-6 text-center text-[13px] text-ink-400">
              No services listed yet — send us a general enquiry.
            </p>
          )}

          {!loading &&
            items.map((s, i) => {
              const Icon = ICONS[i % ICONS.length]
              return (
                <a
                  key={s.id ?? s.slug}
                  href={waLink(s.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-brand-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-gradient group-hover:text-white">
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-ink-800">
                      {s.name}
                    </span>
                    <span className="block truncate text-[12px] text-ink-400">
                      {s.description || 'Ask about this service'}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </a>
              )
            })}

          {!loading && items.length > 0 && (
            <a
              href={waLink('IT support')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-ink-800"
            >
              <MessageCircle size={15} />
              General enquiry
            </a>
          )}
        </div>
      </div>

      {/* Launcher */}
      <button
        onClick={() => setShowList(v => !v)}
        onFocus={openList}
        aria-label="Chat on WhatsApp"
        aria-expanded={showList}
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] transition-all duration-300 hover:scale-105 hover:shadow-[0_14px_38px_-8px_rgba(37,211,102,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25D366]/40" />
        {showList ? (
          <X size={22} className="relative" />
        ) : (
          <MessageCircle size={24} className="relative" />
        )}
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink-900 px-3.5 py-2 text-[13px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 lg:block">
          Chat with us
        </span>
      </button>
    </div>
  )
}
