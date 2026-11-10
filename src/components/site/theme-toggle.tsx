'use client'

import { MoonIcon, SunIcon } from '@phosphor-icons/react/ssr'
import { useEffect, useSyncExternalStore } from 'react'

/*
 * The light/dark switch, a small round button at the bottom of the page. The theme itself is set
 * before paint by the script in app/layout.tsx: the visitor's saved choice if they've made one,
 * else their system's. Until they choose, the page keeps following the system (if it switches
 * while the page is open, so does the page). Pressing the switch saves their choice in
 * localStorage, and from then on that wins.
 */

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  return () => mo.disconnect()
}
const isDark = () => document.documentElement.classList.contains('dark')

function apply(dark: boolean) {
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
}

function saved(): string | null {
  try {
    return localStorage.getItem('theme')
  } catch {
    return null
  }
}

export function ThemeToggle() {
  // null on the server, where the theme isn't known yet.
  const dark = useSyncExternalStore<boolean | null>(
    subscribe,
    isDark,
    () => null
  )

  // No saved choice yet: follow the system as it changes.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const follow = () => {
      if (!saved()) apply(mq.matches)
    }
    mq.addEventListener('change', follow)
    return () => mq.removeEventListener('change', follow)
  }, [])

  const flip = () => {
    const next = !isDark()
    apply(next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="chrome-rim fixed right-5 bottom-4 z-40 flex size-10 items-center justify-center rounded-full border-2 text-foreground shadow-card-hover focus-ring transition-colors hover:border-foreground/40"
    >
      {dark === null ? null : dark ? (
        <SunIcon weight="bold" className="size-5" aria-hidden />
      ) : (
        <MoonIcon weight="bold" className="size-5" aria-hidden />
      )}
    </button>
  )
}
