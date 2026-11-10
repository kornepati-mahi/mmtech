import { useEffect, useRef, useState } from 'react'

/**
 * Shared scroll-reveal engine.
 *
 * One IntersectionObserver drives every registered element, with a throttled
 * scroll/resize fallback for environments where observer callbacks are slow.
 * There is no continuous animation loop, so scrolling stays smooth.
 */
const registry = new Set()
let observer = null
let frame = null

const viewportHeight = () => window.innerHeight || document.documentElement.clientHeight

function ensureObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer
  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target
        registry.delete(el)
        observer.unobserve(el)
        if (el.__reveal) el.__reveal()
      })
    },
    { threshold: 0.04, rootMargin: '0px 0px -40px 0px' }
  )
  return observer
}

/** Fallback check, throttled to one run per animation frame. */
function checkNow() {
  frame = null
  if (!registry.size) return
  const vh = viewportHeight()
  registry.forEach(el => {
    const rect = el.getBoundingClientRect()
    if (rect.top < vh * 0.95 && rect.bottom > 0) {
      registry.delete(el)
      if (observer) observer.unobserve(el)
      if (el.__reveal) el.__reveal()
    }
  })
}

function schedule() {
  if (frame !== null) return
  frame = window.requestAnimationFrame(checkNow)
}

/**
 * Scroll-reveal wrapper driven by CSS transitions.
 *
 * - Reduced-motion users see everything instantly (handled in CSS).
 * - Elements already in view on mount are revealed immediately.
 * - Elements below the fold reveal as they scroll into range.
 */
export default function Reveal({ children, delay = 0, y = 26, x = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    let cancelled = false
    const reveal = () => {
      if (!cancelled) setVisible(true)
    }
    el.__reveal = reveal

    registry.add(el)
    const obs = ensureObserver()
    if (obs) obs.observe(el)

    const onScroll = () => schedule()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    // Guarantee the first paint is never blank for above-the-fold content.
    const timer = window.setTimeout(() => {
      const rect = el.getBoundingClientRect()
      const vh = viewportHeight()
      if (rect.top < vh * 0.95 && rect.bottom > 0) reveal()
    }, 40)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      registry.delete(el)
      if (observer) observer.unobserve(el)
      delete el.__reveal
    }
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        '--reveal-y': `${y}px`,
        '--reveal-x': `${x}px`,
      }}
    >
      {children}
    </Tag>
  )
}
