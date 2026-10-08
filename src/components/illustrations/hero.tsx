import { IllustrationFrame, type IllustrationProps } from './frame'
import { AgentBadge } from './badges/kit'
import { animProps, Dots, Sparkle, Swash } from './primitives'
import { Card, Doc, Lines } from './primitives/objects'
import { Shadowed } from './primitives/shadowed'

/**
 * The home hero: Jackson's photo as the main object (a disc with the hard shadow; the photo itself
 * is laid over it as HTML, at PHOTO), on a big blue swash, ringed by objects from his work: an
 * agent's chat bubble, a stack of documents (RAG), a record (The Cratest) and a session replay
 * window with a cursor (AnyForm). Objects keep clear of the photo disc, since the photo covers it.
 */

/** The photo disc in viewBox units (a 480 square). */
const PHOTO = { cx: 240, cy: 240, r: 136 } as const

/** Where the HTML photo goes, as percentages of the frame: just inside the disc's outline. */
export const HERO_PHOTO_BOX = (() => {
  const r = PHOTO.r - 1
  const pct = (v: number) => `${((v / 480) * 100).toFixed(3)}%`
  return { left: pct(PHOTO.cx - r), top: pct(PHOTO.cy - r), size: pct(2 * r) }
})()

export function HeroArt(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="hero" {...props}>
      <Swash shape="wide" accent="blue" x={24} y={128} w={432} rotate={-12} origin="15% 85%" />

      <Shadowed dx={8} dy={8}>
        <circle className="ill-f-paper ill-s ill-s-bold" cx={PHOTO.cx} cy={PHOTO.cy} r={PHOTO.r} />
      </Shadowed>

      {/* An agent's chat bubble, top left. */}
      <g {...animProps({ anim: 'float', delay: 1200 })}>
        <path className="ill-f-sky-tint ill-s" d="M56 112L48 136L80 112Z" />
        <Card x={16} y={48} w={128} h={64} tone="sky-tint" />
        <Lines x={32} y={72} w={88} widths={[1, 0.6]} gap={16} onLight />
        <AgentBadge cx={140} cy={48} r={16} delay={500} />
      </g>

      {/* A stack of documents, top right. */}
      <g {...animProps({ anim: 'float', delay: 1400 })}>
        <Doc x={344} y={32} w={72} h={88} tone="lavender-tint" />
        <Doc x={364} y={52} w={72} h={88} />
        <Lines x={376} y={84} w={44} widths={[1, 0.8, 0.5]} gap={12} />
      </g>

      {/* A record, bottom left. */}
      <g {...animProps({ anim: 'float', delay: 1600 })}>
        <circle className="ill-f-ink ill-s" cx={88} cy={392} r={48} />
        <circle className="ill-f-none ill-s ill-s-paper" cx={88} cy={392} r={34} />
        <circle className="ill-f-sun ill-s ill-s-ink-fixed" cx={88} cy={392} r={16} />
        <circle className="ill-f-ink-fixed" cx={88} cy={392} r={3} />
      </g>

      {/* A session replay window with a cursor, bottom right. */}
      <g {...animProps({ anim: 'float', delay: 1800 })}>
        <Card x={336} y={360} w={128} h={88} />
        <path className="ill-f-none ill-s" d="M336 380H464M352 428H448" />
        <circle className="ill-f-ink" cx={348} cy={370} r={3} />
        <circle className="ill-f-ink" cx={360} cy={370} r={3} />
        <circle className="ill-f-mint ill-s" cx={392} cy={428} r={6} />
        <path className="ill-f-paper ill-s" d="M412 392V416L418 410L423 420L428 418L423 408H432Z" />
      </g>

      <Sparkle x={40} y={224} r={12} delay={800} />
      <Sparkle x={448} y={256} r={8} delay={1000} />
      <Dots x={208} y={456} count={4} gap={16} r={3} anim="rise" delay={900} />
    </IllustrationFrame>
  )
}
