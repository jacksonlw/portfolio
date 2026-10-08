/**
 * The skill area badges, one per area in the skills constellation, drawn in the same badge grammar
 * as the project badges (badges/kit.tsx): one main object with the hard shadow, the family swash
 * in the area's accent, at most one status, one or two sparkles. On the 4-unit grid.
 */
import { IllustrationFrame, type IllustrationProps } from '../frame'
import { animProps } from '../primitives'
import { Card, Cylinder, Lines } from '../primitives/objects'
import { Shadowed } from '../primitives/shadowed'
import { CheckBadge } from '../primitives/status'
import { AgentBadge, FamilySparkles, FamilySwash, STATUS } from './kit'

/** AI & agents: a chat window where an agent answers, with the agent's sparkle. */
export function AgentsBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="sky" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <Card x={24} y={44} w={96} h={80} />
          <rect className="ill-f-sky-tint ill-s" x={36} y={56} width={52} height={20} rx={4} />
          <rect className="ill-f-paper ill-s" x={56} y={88} width={52} height={24} rx={4} />
          <Lines x={44} y={66} w={36} widths={[1]} onLight />
          <Lines x={64} y={96} w={36} widths={[1, 0.6]} />
        </Shadowed>
        <AgentBadge delay={450} />
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}

/** Languages: a code editor with angle brackets and a slash. */
export function LanguagesBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="lavender" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <Card x={20} y={44} w={104} h={80} />
          <path className="ill-f-none ill-s" d="M20 60H124" />
          <circle className="ill-f-ink" cx={28} cy={52} r={2} />
          <circle className="ill-f-ink" cx={36} cy={52} r={2} />
          <path className="ill-f-none ill-s ill-s-bold" d="M56 80L44 92L56 104M88 80L100 92L88 104M78 76L66 108" />
        </Shadowed>
        <g {...animProps({ anim: 'pop', delay: 450 })}>
          <circle className="ill-f-lavender ill-s" cx={STATUS.cx + 4} cy={STATUS.cy - 8} r={14} />
          <path className="ill-f-none ill-s ill-s-ink-fixed" d="M110 44H122M110 50H118" />
        </g>
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}

/** Frontend & mobile: a browser window with a phone standing in front of it. */
export function FrontendBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="mint" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Card x={16} y={40} w={96} h={68} />
        <path className="ill-f-none ill-s" d="M16 56H112" />
        <rect className="ill-f-mint-tint ill-s" x={28} y={68} width={40} height={28} rx={2} />
        <Lines x={76} y={72} w={24} widths={[1, 0.6]} />
        <Shadowed>
          <Card x={92} y={64} w={40} h={68} r={6} />
          <path className="ill-f-none ill-s" d="M104 72H120M106 124H118" />
          <rect className="ill-f-mint ill-s" x={100} y={84} width={24} height={16} rx={2} />
          <Lines x={100} y={108} w={24} widths={[1]} />
        </Shadowed>
      </g>
      <FamilySparkles big="topRight" small="bottomLeft" />
    </IllustrationFrame>
  )
}

/** Backend & data: a database, with a check that the data went through. */
export function BackendBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="sun" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <Cylinder x={36} y={40} w={72} h={88} bands={2} tone="sun-tint" />
        </Shadowed>
        <CheckBadge cx={108} cy={52} r={16} delay={450} />
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}

/** Cloud & tools: a cloud with a small terminal tile in front of it. */
export function CloudBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="ocean" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <path
            className="ill-f-ocean-tint ill-s"
            d="M40 112A20 20 0 0 1 40 72A32 32 0 0 1 100 64A24 24 0 0 1 120 112Z"
          />
        </Shadowed>
        <rect className="ill-f-ink ill-s" x={64} y={92} width={48} height={36} rx={4} />
        <path className="ill-f-none ill-s ill-s-paper" d="M72 104L78 110L72 116M84 116H96" />
      </g>
      <FamilySparkles big="topRight" small="bottomLeft" />
    </IllustrationFrame>
  )
}

/** How I work: a board with cards moving across its columns, one done. */
export function WorkBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="peach" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <Card x={20} y={44} w={104} h={80} />
          <path className="ill-f-none ill-s" d="M56 44V124M88 44V124" />
          <rect className="ill-f-peach-tint ill-s" x={28} y={56} width={20} height={16} rx={2} />
          <rect className="ill-f-peach-tint ill-s" x={28} y={80} width={20} height={16} rx={2} />
          <rect className="ill-f-peach ill-s" x={64} y={56} width={16} height={16} rx={2} />
          <rect className="ill-f-paper ill-s" x={96} y={56} width={20} height={16} rx={2} />
        </Shadowed>
        <CheckBadge cx={112} cy={48} r={14} delay={450} />
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}
