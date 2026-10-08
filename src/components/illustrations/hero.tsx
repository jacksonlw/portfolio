import { IllustrationFrame, type IllustrationProps } from './frame'
import { AgentBadge } from './badges/kit'
import { animProps, Dots, Sparkle, Swash } from './primitives'
import { Card, Lines } from './primitives/objects'
import { Shadowed } from './primitives/shadowed'

/**
 * The home hero: Jackson's photo as the main object (a disc with the hard shadow; the photo itself
 * is laid over it as HTML, at PHOTO), on a big blue swash, ringed by his story in every brand
 * accent: the AI agents he builds at Oracle (sky), his Northeastern degree (lavender), the startup
 * he co-founded (mint) and the stages he presented on, Oracle OpenWorld and TEDx (sun). Objects
 * keep clear of the photo disc, since the photo covers it.
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

      {/* The AI agents he builds: a chat bubble with the agent's sparkle, top left. */}
      <g {...animProps({ anim: 'float', delay: 1200 })}>
        <path className="ill-f-sky-tint ill-s" d="M56 112L48 136L80 112Z" />
        <Card x={16} y={48} w={128} h={64} tone="sky-tint" />
        <Lines x={32} y={72} w={88} widths={[1, 0.6]} gap={16} onLight />
        <AgentBadge cx={140} cy={48} r={16} delay={500} />
      </g>

      {/* His degree: a graduation cap, top right. */}
      <g {...animProps({ anim: 'float', delay: 1400 })}>
        <rect className="ill-f-lavender-tint ill-s" x={360} y={80} width={64} height={40} rx={4} />
        <path className="ill-f-lavender ill-s" d="M392 40L456 72L392 104L328 72Z" />
        <path className="ill-f-none ill-s" d="M392 72L448 84V116" />
        <circle className="ill-f-ink" cx={448} cy={120} r={5} />
      </g>

      {/* The startup: a rocket lifting off, bottom left. */}
      <g {...animProps({ anim: 'float', delay: 1600 })}>
        <g transform="rotate(18 80 400)">
          <path className="ill-f-sun ill-s" d="M68 432L80 456L92 432Z" />
          <path className="ill-f-mint ill-s" d="M64 400L44 424V440L64 428Z" />
          <path className="ill-f-mint ill-s" d="M96 400L116 424V440L96 428Z" />
          <path className="ill-f-paper ill-s" d="M80 320A16 40 0 0 1 96 360V432H64V360A16 40 0 0 1 80 320Z" />
          <circle className="ill-f-sky ill-s" cx={80} cy={376} r={9} />
        </g>
      </g>

      {/* The stage: a microphone on its stand, bottom right. */}
      <g {...animProps({ anim: 'float', delay: 1800 })}>
        <path className="ill-f-none ill-s" d="M368 376A32 32 0 0 0 432 376M400 408V448M376 448H424" />
        <rect className="ill-f-sun ill-s" x={380} y={328} width={40} height={64} rx={20} />
        <path className="ill-f-none ill-s ill-s-ink-fixed" d="M388 348H412M388 360H412M388 372H412" />
      </g>

      <Sparkle x={40} y={224} r={12} delay={800} />
      <Sparkle x={448} y={256} r={8} delay={1000} />
      <Dots x={208} y={456} count={4} gap={16} r={3} anim="rise" delay={900} />
    </IllustrationFrame>
  )
}
