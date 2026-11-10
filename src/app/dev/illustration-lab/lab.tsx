'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { DRAWINGS } from '@/components/illustrations/drawings'
import { Illustration } from '@/components/illustrations/registry'
import { cn } from '@/lib/cn'

/*
 * The illustration lab (development only). Every direction side by side (columns) for every subject
 * (rows), inside the same chrome disc the site uses. Rate the directions, heart the drawings that
 * work, pick a favourite, note what's off, and save: it lands in docs/illustration-lab/feedback.json,
 * which the next round is designed from.
 */

/** What this round is asking. Updated each round, with what changed since the last. */
const ROUND = {
  number: 9,
  changes:
    'Back to the original illustrations and coloured discs, now in softer pastel tones. The chrome glyphs and scene experiments are retired. This round is a baseline: every drawing as it stands on the site.',
  ask: 'Heart the drawings that work and note any that should be redrawn (Trailblaze, for one, still shows a mountain rather than a recruiting app).'
}

const COLUMNS = ['live'] as const
type Column = (typeof COLUMNS)[number]
const INFO: Record<Column, { title: string; note: string }> = {
  live: {
    title: 'On the site',
    note: 'The original drawings in pastel, on their coloured discs.'
  }
}
const titleOf = (c: Column) => INFO[c].title
const noteOf = (c: Column) => INFO[c].note

const SIZES = [64, 96, 128] as const
const DISCS = ['colour', 'none'] as const
type Disc = (typeof DISCS)[number]

type Saved = {
  round: number
  favourite: Column | null
  ratings: Partial<Record<Column, number>>
  notes: Partial<Record<Column, string>>
  /** "direction:subject" for each drawing hearted. */
  liked: string[]
  general: string
}

const STORE = `illustration-lab:round-${ROUND.number}`
const blank = (): Saved => ({
  round: ROUND.number,
  favourite: null,
  ratings: {},
  notes: {},
  liked: [],
  general: ''
})

function Cell({
  subject,
  size,
  disc
}: {
  subject: string
  size: number
  disc: Disc
}) {
  const d = DRAWINGS[subject]
  const art = (
    <span className="block" style={{ width: size * 0.6 }}>
      <Illustration name={subject} decorative />
    </span>
  )
  return (
    <span
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-full',
        disc === 'colour' && 'node-disc border-2'
      )}
      style={
        {
          width: size,
          height: size,
          '--disc-accent': `var(--af-${d.accent})`,
          '--disc-deep': `var(--af-${d.accent}-deep)`
        } as CSSProperties
      }
    >
      {art}
    </span>
  )
}

export function Lab() {
  const [state, setState] = useState<Saved>(blank)
  const [size, setSize] = useState<(typeof SIZES)[number]>(96)
  const [disc, setDisc] = useState<Disc>('colour')
  const [dark, setDark] = useState(false)
  const [status, setStatus] = useState('')

  // Restore this browser's draft, else what was saved for this round.
  useEffect(() => {
    let draft: Saved | null = null
    try {
      const raw = localStorage.getItem(STORE)
      if (raw) draft = JSON.parse(raw) as Saved
    } catch {}
    if (draft) {
      // Restoring from browser storage, which the server render can't see.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ ...blank(), ...draft })
      return
    }
    fetch('/dev/feedback?lab=illustration')
      .then((r) => (r.ok ? r.json() : null))
      .then((all) => {
        const saved = all?.rounds?.[String(ROUND.number)] as Saved | undefined
        if (saved) setState({ ...blank(), ...saved })
      })
      .catch(() => {})
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state))
    } catch {}
  }, [state])

  // "On dark" uses the site's real dark theme, so the discs and drawings look exactly as they would.
  useEffect(() => {
    const root = document.documentElement
    const was = root.classList.contains('dark')
    root.classList.toggle('dark', dark)
    return () => {
      root.classList.toggle('dark', was)
    }
  }, [dark])

  const patch = (p: Partial<Saved>) => setState((s) => ({ ...s, ...p }))
  const save = async () => {
    setStatus('Saving…')
    try {
      const r = await fetch('/dev/feedback?lab=illustration', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(state)
      })
      const j = await r.json()
      setStatus(
        r.ok ? `Saved to ${j.file}. Tell Claude it's ready.` : 'Save failed'
      )
    } catch {
      setStatus('Save failed: is the dev server running?')
    }
  }

  const subjects = Object.keys(DRAWINGS)
  const pill = (on: boolean) =>
    cn(
      'rounded-full px-3 py-1 text-xs font-medium capitalize',
      on ? 'bg-foreground text-background' : 'text-muted-foreground'
    )

  return (
    <div className="min-h-dvh pb-24">
      <div className="px-6 pt-10">
        <p className="font-mono text-xs text-muted-foreground">
          Illustration lab · round {ROUND.number}
        </p>
        <h1 className="mt-1 text-title">Which direction?</h1>
        <p className="mt-3 max-w-3xl text-pretty text-muted-foreground">
          {ROUND.changes}
        </p>
        <p className="mt-2 max-w-3xl font-medium text-pretty">{ROUND.ask}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Size
            </span>
            <div className="flex rounded-full border border-border p-0.5">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={pill(size === s)}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Disc
            </span>
            <div className="flex rounded-full border border-border p-0.5">
              {DISCS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDisc(d)}
                  aria-pressed={disc === d}
                  className={pill(disc === d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={dark}
              onChange={(e) => setDark(e.target.checked)}
            />
            On dark
          </label>
        </div>
      </div>

      {/* Directions across, subjects down. Scrolls sideways; the subject column stays put. */}
      <div className="mt-6 overflow-x-auto px-6">
        <table className="border-separate border-spacing-x-1 border-spacing-y-2">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background" />
              {COLUMNS.map((n) => {
                const rating = state.ratings[n] ?? 0
                const fav = state.favourite === n
                return (
                  <th key={n} className="w-44 min-w-44 align-top font-normal">
                    <div
                      className={cn(
                        'rounded-lg border bg-card p-2.5 text-left',
                        fav ? 'border-brand' : 'border-border'
                      )}
                    >
                      <p className="text-sm font-semibold">{titleOf(n)}</p>
                      <p className="mt-1 text-[11px] leading-snug text-pretty text-muted-foreground">
                        {noteOf(n)}
                      </p>
                      <div className="mt-2 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() =>
                              patch({
                                ratings: {
                                  ...state.ratings,
                                  [n]: rating === k ? 0 : k
                                }
                              })
                            }
                            className={cn(
                              'size-6 rounded border text-[11px] font-semibold',
                              k <= rating
                                ? 'border-brand bg-brand text-brand-foreground'
                                : 'border-border'
                            )}
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => patch({ favourite: fav ? null : n })}
                        className={cn(
                          'mt-2 w-full rounded-full border px-2 py-1 text-[11px] font-semibold',
                          fav
                            ? 'border-brand bg-brand text-brand-foreground'
                            : 'border-border'
                        )}
                      >
                        {fav ? '★ Favourite' : 'Make favourite'}
                      </button>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {subjects.map((k) => (
              <tr key={k}>
                <th className="sticky left-0 z-10 bg-background pr-2 text-left align-middle font-normal">
                  <p className="text-sm font-semibold">{k}</p>
                  <p className="max-w-32 text-[11px] text-pretty text-muted-foreground">
                    {DRAWINGS[k].label}
                  </p>
                </th>
                {COLUMNS.map((n) => {
                  const id = `${n}:${k}`
                  const liked = state.liked.includes(id)
                  return (
                    <td key={n} className="text-center align-middle">
                      <button
                        type="button"
                        onClick={() =>
                          patch({
                            liked: liked
                              ? state.liked.filter((x) => x !== id)
                              : [...state.liked, id]
                          })
                        }
                        title={liked ? 'Unheart' : 'Heart: this one works'}
                        className={cn(
                          'relative inline-flex rounded-xl border-2 p-2',
                          liked
                            ? 'border-brand'
                            : 'border-transparent hover:border-border'
                        )}
                      >
                        <Cell subject={k} size={size} disc={disc} />
                        <span
                          className={cn(
                            'absolute top-0.5 right-1 text-xs',
                            liked ? 'text-brand' : 'text-muted-foreground/30'
                          )}
                          aria-hidden
                        >
                          {liked ? '♥' : '♡'}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <th className="sticky left-0 z-10 bg-background" />
              {COLUMNS.map((n) => (
                <td key={n} className="align-top">
                  <textarea
                    value={state.notes[n] ?? ''}
                    onChange={(e) =>
                      patch({ notes: { ...state.notes, [n]: e.target.value } })
                    }
                    placeholder="Notes on this direction"
                    rows={4}
                    className="w-full rounded-md border border-border bg-card p-2 text-xs"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-3xl px-6">
        <label className="text-sm font-semibold" htmlFor="general">
          Anything else
        </label>
        <textarea
          id="general"
          value={state.general}
          onChange={(e) => patch({ general: e.target.value })}
          placeholder="Mixes to try, references you like, directions to drop"
          rows={4}
          className="mt-2 w-full rounded-md border border-border bg-card p-3 text-sm"
        />
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground focus-ring"
          >
            Save feedback
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear this round’s ratings, hearts and notes?'))
                setState(blank())
            }}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Reset round
          </button>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {status}
          </p>
        </div>
      </div>
    </div>
  )
}
