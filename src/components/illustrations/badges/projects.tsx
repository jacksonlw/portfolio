/**
 * The project badges: one per project, drawn in the AnyForm badge grammar (badges/kit.tsx). One
 * main object with the hard shadow, the family swash behind it in the project's accent, an
 * optional status at the top right, one or two sparkles. Coordinates on the 4-unit grid.
 */
import { IllustrationFrame, type IllustrationProps } from '../frame'
import { animProps, sparklePath } from '../primitives'
import { Card, Lines } from '../primitives/objects'
import { Shadowed } from '../primitives/shadowed'
import { CheckBadge } from '../primitives/status'
import { AgentBadge, FamilySparkles, FamilySwash, STATUS } from './kit'

/** AnyForm: a session replay window, a scout's cursor on it and a magnifier over the corner. */
export function AnyFormBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="sky" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <Card x={20} y={44} w={96} h={72} />
          <path className="ill-f-none ill-s" d="M20 60H116" />
          <circle className="ill-f-ink" cx={28} cy={52} r={2} />
          <circle className="ill-f-ink" cx={36} cy={52} r={2} />
          {/* The replay's timeline and its playhead. */}
          <path className="ill-f-none ill-s" d="M32 100H104" />
          <circle className="ill-f-sky ill-s" cx={60} cy={100} r={4} />
          <Lines x={32} y={72} w={40} widths={[1, 0.6]} />
        </Shadowed>
        {/* The scout's cursor. */}
        <path className="ill-f-paper ill-s" d="M80 72V92L85 87L89 95L93 93L89 85H96Z" />
        <circle className="ill-f-sky-tint ill-s" cx={108} cy={112} r={14} />
        <path className="ill-f-none ill-s ill-s-bold" d="M118 122L128 132" />
        <AgentBadge delay={450} />
      </g>
      <FamilySparkles big="topLeft" small="bottomLeft" />
    </IllustrationFrame>
  )
}

/** The Cratest: a record rising out of a crate, and a review star popping out. */
export function CratestBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="sun" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <circle className="ill-f-ink ill-s" cx={72} cy={72} r={32} />
          <circle className="ill-f-none ill-s ill-s-paper" cx={72} cy={72} r={22} />
          <circle className="ill-f-sun ill-s ill-s-ink-fixed" cx={72} cy={72} r={10} />
          <circle className="ill-f-ink-fixed" cx={72} cy={72} r={2} />
          <Card x={24} y={84} w={96} h={40} tone="sun-tint" />
          <path className="ill-f-none ill-s ill-s-ink-fixed" d="M24 104H120" />
        </Shadowed>
        <g {...animProps({ anim: 'pop', delay: 450 })}>
          <circle className="ill-f-sun ill-s" cx={STATUS.cx} cy={STATUS.cy} r={STATUS.r} />
          <path className="ill-f-ink-fixed" d={sparklePath(STATUS.cx, STATUS.cy, 10, 0.32)} />
        </g>
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}

/** Trailblaze: a phone with two job cards on screen, and a match check. */
export function TrailblazeBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="ocean" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <Card x={40} y={28} w={60} h={104} r={8} />
          <path className="ill-f-none ill-s" d="M64 36H76M64 124H76" />
          <Card x={48} y={48} w={44} h={28} r={2} tone="ocean-tint" />
          <Lines x={54} y={58} w={32} widths={[1, 0.6]} onLight />
          <Card x={48} y={84} w={44} h={28} r={2} />
          <Lines x={54} y={94} w={32} widths={[1, 0.6]} />
        </Shadowed>
        <CheckBadge cx={100} cy={48} r={16} delay={450} />
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}

/** KoiStream: a broadcast camera on a tripod, recording. */
export function KoiStreamBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="lavender" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <path className="ill-f-none ill-s" d="M64 104L44 136M64 104L84 136M64 104V136" />
        <Shadowed>
          <path className="ill-f-none ill-s ill-s-bold" d="M40 60V48H80V60" />
          <Card x={24} y={60} w={80} h={44} />
          <path className="ill-f-lavender-tint ill-s" d="M104 72L128 64V100L104 92Z" />
          <circle className="ill-f-lavender ill-s" cx={48} cy={82} r={10} />
          <Lines x={68} y={76} w={24} widths={[1, 0.6]} />
        </Shadowed>
        <g {...animProps({ anim: 'pop', delay: 450 })}>
          <circle className="ill-f-lavender ill-s" cx={120} cy={40} r={14} />
          <circle className="ill-f-ink-fixed" cx={120} cy={40} r={5} />
        </g>
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}

/** TEDx: an event ticket with a tear-off stub, tilted. */
export function TedxBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="rose" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <g transform="rotate(-10 80 84)">
          <Shadowed>
            <path
              className="ill-f-paper ill-s"
              d="M20 60H140V76A8 8 0 0 0 140 92V108H20V92A8 8 0 0 0 20 76Z"
            />
            <path className="ill-f-none ill-s ill-dash" d="M108 64V104" />
            <Lines x={32} y={76} w={60} widths={[1, 0.7, 0.4]} />
            <rect className="ill-f-rose ill-s" x={116} y={76} width={16} height={16} rx={2} />
          </Shadowed>
        </g>
      </g>
      <FamilySparkles big="topRight" small="bottomLeft" />
    </IllustrationFrame>
  )
}

/** Branch: a school building with a young tree beside it. */
export function BranchBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="mint" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <rect className="ill-f-paper ill-s" x={28} y={72} width={88} height={52} rx={2} />
          <path className="ill-f-paper ill-s" d="M20 72L72 40L124 72Z" />
          <circle className="ill-f-mint ill-s" cx={72} cy={60} r={6} />
          <rect className="ill-f-mint-tint ill-s" x={36} y={84} width={16} height={16} rx={2} />
          <rect className="ill-f-mint-tint ill-s" x={92} y={84} width={16} height={16} rx={2} />
          <rect className="ill-f-paper ill-s" x={64} y={100} width={16} height={24} rx={2} />
        </Shadowed>
        {/* A young tree beside the school: the branch. */}
        <path className="ill-f-none ill-s" d="M136 124V104" />
        <circle className="ill-f-mint ill-s" cx={136} cy={96} r={12} />
      </g>
      <FamilySparkles big="topLeft" />
    </IllustrationFrame>
  )
}

/** Oracle (a work bubble, not a project): a work briefcase with the agent's sparkle. */
export function OracleBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="rose" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <Shadowed>
          <path className="ill-f-none ill-s ill-s-bold" d="M56 60V48H88V60" />
          <Card x={20} y={60} w={104} h={64} />
          <path className="ill-f-none ill-s" d="M20 84H124" />
          <rect className="ill-f-rose ill-s" x={64} y={76} width={16} height={16} rx={2} />
        </Shadowed>
        <AgentBadge tone="rose" delay={450} />
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}

/** CareerFoundry (a work bubble): a chalkboard on an easel with a lesson in code on it. */
export function CareerFoundryBadge(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="badge" {...props}>
      <FamilySwash accent="peach" />
      <g {...animProps({ anim: 'float', delay: 1100 })}>
        <path className="ill-f-none ill-s" d="M52 112L40 136M92 112L104 136" />
        <Shadowed>
          <Card x={20} y={40} w={104} h={72} tone="peach-tint" />
          <path className="ill-f-none ill-s ill-s-bold ill-s-ink-fixed" d="M40 64L32 72L40 80M56 64L64 72L56 80" />
          <Lines x={76} y={64} w={36} widths={[1, 0.7, 0.45]} onLight />
        </Shadowed>
        <CheckBadge cx={STATUS.cx + 8} cy={STATUS.cy - 12} r={14} delay={450} />
      </g>
      <FamilySparkles big="topLeft" small="bottomRight" />
    </IllustrationFrame>
  )
}
