import { useEffect } from 'react'

/**
 * Reveals any element carrying a `data-reveal` attribute as it scrolls into
 * view (fade + rise). A MutationObserver keeps watching, so elements added
 * later (live rows, modals) animate in too.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    const seen = new WeakSet<Element>()
    const scan = () => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        if (seen.has(el) || el.classList.contains('reveal-in')) return
        seen.add(el)
        io.observe(el)
      })
    }

    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
