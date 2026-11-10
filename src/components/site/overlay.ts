'use client'

import { useEffect, useSyncExternalStore, type RefObject } from 'react'

/*
 * Behaviour shared by the things that cover the page: the mobile sheet and a bubble's Story.
 */

/**
 * The page behind stays put while something covers it. iOS ignores overflow: hidden on the body for
 * touch scrolling, so the body is pinned in place and the scroll position restored on release.
 */
export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const { body } = document
    const y = window.scrollY
    const prev = body.style.cssText
    Object.assign(body.style, {
      position: 'fixed',
      top: `-${y}px`,
      left: '0',
      right: '0',
      overflow: 'hidden'
    })
    return () => {
      body.style.cssText = prev
      window.scrollTo({ top: y, behavior: 'instant' })
    }
  }, [locked])
}

/**
 * Swipe down to dismiss, like a native sheet: once `scroller` is scrolled to the top, pulling down
 * drags `el` with the finger (the scrim fading with it). Let go past a quarter of its height, or
 * with a quick flick, and it closes; otherwise it springs back. `scroller` defaults to `el`.
 */
export function useSwipeToClose(
  el: RefObject<HTMLElement | null>,
  scrim: RefObject<HTMLElement | null>,
  enabled: boolean,
  onClose: () => void,
  scroller?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const node = el.current
    const scrollEl = scroller?.current ?? node
    if (!node || !scrollEl || !enabled) return
    let startY = 0
    let startT = 0
    let offset = 0
    let dragging = false
    const set = (px: number) => {
      offset = px
      node.style.translate = `0 ${px}px`
      if (scrim.current)
        scrim.current.style.opacity = String(1 - px / node.offsetHeight)
    }
    const reset = () => {
      node.style.transition = ''
      node.style.translate = ''
      if (scrim.current) {
        scrim.current.style.transition = ''
        scrim.current.style.opacity = ''
      }
    }
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      startT = e.timeStamp
      dragging = false
      offset = 0
    }
    const onMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      if (!dragging) {
        if (y <= startY || scrollEl.scrollTop > 0) return
        // A sideways swipe (the gallery) is never a dismiss.
        if ((e.target as Element).closest('[data-swipe-x]')) return
        // Start the drag from here, so a scroll that reached the top doesn't jump the sheet.
        dragging = true
        startY = y
        startT = e.timeStamp
        node.style.transition = 'none'
        if (scrim.current) scrim.current.style.transition = 'none'
      }
      e.preventDefault()
      set(Math.max(0, y - startY))
    }
    const onEnd = (e: TouchEvent) => {
      if (!dragging) return
      dragging = false
      const speed = offset / Math.max(1, e.timeStamp - startT)
      const dismiss =
        offset > node.offsetHeight * 0.25 || (speed > 0.5 && offset > 12)
      reset()
      if (dismiss) onClose()
    }
    node.addEventListener('touchstart', onStart, { passive: true })
    node.addEventListener('touchmove', onMove, { passive: false })
    node.addEventListener('touchend', onEnd)
    node.addEventListener('touchcancel', onEnd)
    return () => {
      node.removeEventListener('touchstart', onStart)
      node.removeEventListener('touchmove', onMove)
      node.removeEventListener('touchend', onEnd)
      node.removeEventListener('touchcancel', onEnd)
      reset()
    }
  }, [el, scrim, scroller, enabled, onClose])
}

/*
 * While a Story covers the page, what's behind it holds still: the constellation's motion loop
 * stops and its looping animations pause (globals.css, html[data-story-open]). Nothing behind the
 * scrim changes then, so the browser isn't redrawing and re-blurring a moving page on every frame
 * for something nobody is looking at. It all carries on from where it stopped.
 */
let covered = false
const coverListeners = new Set<() => void>()

export const pageCovered = () => covered

export function setPageCovered(on: boolean) {
  if (covered === on) return
  covered = on
  document.documentElement.toggleAttribute('data-story-open', on)
  coverListeners.forEach((cb) => cb())
}

export function onPageCovered(cb: () => void) {
  coverListeners.add(cb)
  return () => {
    coverListeners.delete(cb)
  }
}

/** Whether the visitor has asked for less motion (read when it's needed, not on render). */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const REDUCE = '(prefers-reduced-motion: reduce)'

/** The same, as state that follows the setting (false on the server). */
export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(REDUCE)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(REDUCE).matches,
    () => false
  )
}
