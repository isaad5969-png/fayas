import { useEffect, useState } from 'react'

/* ── Initialise dark class before first paint ── */
const initTheme = () => {
  const saved = localStorage.getItem('fayas-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = saved === 'dark' || (!saved && prefersDark)
  document.documentElement.classList.toggle('dark', dark)
  return dark
}

/* ── Thin provider — just runs once on mount ── */
export function ThemeProvider({ children }) {
  useEffect(() => { initTheme() }, [])
  return children
}

/* ── Hook: reads + toggles the dark class directly on <html> ── */
export function useTheme() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  const toggle = () => {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('fayas-theme', next ? 'dark' : 'light')
    setIsDark(next)
  }

  return { isDark, toggle, theme: isDark ? 'dark' : 'light' }
}
