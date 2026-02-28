import { useState, useEffect } from 'react'

/**
 * Watches the `dark` class on <html> via MutationObserver.
 * Used by components that can't express theme via Tailwind classes
 * (e.g. recharts props that accept raw hex strings).
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return isDark
}
