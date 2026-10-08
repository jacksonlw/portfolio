/**
 * The three pilot pieces in the sketch style (README.md): one job, one project and one skill
 * area. Each is an object doing its job with a hand in the action, in two pastels.
 */
import { IllustrationFrame, type IllustrationProps } from '../frame'
import { boxPoints, ellipsePoints, type Pt } from './curve'
import { Hand, Ink, Shape, Squiggle, Ticks } from './primitives'

/** A speech bubble: a rounded box with a tail off its bottom edge (`left` or `right`). */
function bubblePoints(
  x: number,
  y: number,
  w: number,
  h: number,
  tail: 'left' | 'right'
): Pt[] {
  const box = boxPoints(x, y, w, h, 8)
  const t = tail === 'left' ? x + w * 0.3 : x + w * 0.7
  const dir = tail === 'left' ? -1 : 1
  const tailPts: Pt[] = [
    [t + 8, y + h],
    [t + dir * 4, y + h + 13],
    [t - 4, y + h]
  ]
  // The bottom edge runs right to left at indexes 8–10; the tail goes in after the middle.
  return [
    ...box.slice(0, 10),
    ...(tail === 'left' ? tailPts : tailPts),
    ...box.slice(10)
  ]
}

/** Three ink dots in a row: someone (or an agent) typing. */
function Dots({ x, y, gap = 9 }: { x: number; y: number; gap?: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} className="ill-f-ink" cx={x + i * gap} cy={y} r={2.6} />
      ))}
    </g>
  )
}

/** Oracle: a hand carrying a work briefcase, an agent's chat bubble popping out of it. */
export function OracleSketch(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="sketch" {...props}>
      <Squiggle x={14} y={178} w={46} loops={3} rotate={-8} />
      {/* The agent's reply, rising out of the case. */}
      <Shape
        points={bubblePoints(22, 26, 70, 40, 'right')}
        tone="sky"
        paper
        seed={4}
        tension={0.8}
      />
      <Dots x={46} y={46} />
      {/* The case and its handle. */}
      <Ink
        seed={6}
        points={[
          [84, 90],
          [86, 72],
          [114, 72],
          [116, 90]
        ]}
      />
      <Shape
        points={boxPoints(48, 88, 104, 64, 8)}
        tone="rose"
        paper
        seed={9}
      />
      <Ink
        seed={12}
        jitter={0.8}
        points={[
          [50, 112],
          [100, 113],
          [150, 111]
        ]}
      />
      <Shape
        points={boxPoints(91, 105, 18, 14, 3)}
        tone="sky"
        paper
        seed={15}
        jitter={0.5}
      />
      <Hand x={108} y={52} angle={112} sleeve="rose" stripes seed={20} />
      <Ticks x={154} y={130} angle={0} />
    </IllustrationFrame>
  )
}

/** AnyForm: a session replay in a browser window, a hand holding a magnifier over the finding. */
export function AnyFormSketch(props: IllustrationProps) {
  const lens = ellipsePoints(122, 112, 27, 27, 12)
  return (
    <IllustrationFrame kind="sketch" {...props}>
      {/* The window, its title bar and the replay inside. */}
      <Shape
        points={boxPoints(20, 34, 132, 104, 8)}
        tone="sky"
        paper
        seed={3}
      />
      <Ink
        seed={5}
        jitter={0.6}
        points={[
          [22, 54],
          [86, 55],
          [150, 53]
        ]}
      />
      <circle className="ill-f-ink" cx={32} cy={44} r={2.6} />
      <circle className="ill-f-ink" cx={42} cy={44} r={2.6} />
      <Ink
        thin
        seed={7}
        points={[
          [36, 74],
          [60, 73],
          [78, 75]
        ]}
      />
      <Ink
        thin
        seed={8}
        points={[
          [36, 84],
          [52, 85]
        ]}
      />
      {/* The flagged element the replay found. */}
      <Shape
        points={boxPoints(36, 100, 44, 16, 4)}
        tone="sun"
        paper
        seed={10}
        jitter={0.6}
      />
      {/* The user's cursor trail and cursor. */}
      <Ink
        thin
        seed={11}
        points={[
          [40, 128],
          [62, 132],
          [70, 122],
          [62, 116],
          [76, 108]
        ]}
      />
      <Shape
        points={[
          [78, 100],
          [78, 118],
          [83, 113],
          [87, 121],
          [91, 119],
          [87, 111],
          [94, 110]
        ]}
        paper
        seed={13}
        jitter={0.3}
        tension={0.15}
      />
      {/* The magnifier: lens over the finding, handle into the hand. */}
      <Shape points={lens} paper seed={17} jitter={0.6} />
      <Ink
        thin
        seed={18}
        points={[
          [106, 104],
          [110, 96],
          [118, 92]
        ]}
      />
      <Shape
        points={[
          [136, 128],
          [143, 122],
          [160, 140],
          [153, 146]
        ]}
        tone="sun"
        paper
        seed={19}
        jitter={0.4}
        tension={0.4}
      />
      <Hand x={168} y={158} angle={-135} sleeve="sun" stripes seed={23} />
      <Ticks x={156} y={86} angle={-40} length={9} />
    </IllustrationFrame>
  )
}

/** AI & agents: agents talking in chat bubbles, a hand with a pen drawing the lines between them. */
export function AgentsSketch(props: IllustrationProps) {
  return (
    <IllustrationFrame kind="sketch" {...props}>
      <Squiggle x={132} y={22} w={42} loops={3} rotate={10} />
      {/* The orchestration: loose lines from one agent to the next. */}
      <Ink
        seed={2}
        jitter={1.4}
        points={[
          [66, 66],
          [84, 86],
          [118, 92],
          [136, 90]
        ]}
      />
      <Ink
        seed={3}
        jitter={1.4}
        points={[
          [58, 70],
          [54, 92],
          [62, 116]
        ]}
      />
      <Shape
        points={bubblePoints(18, 26, 66, 38, 'left')}
        tone="sky"
        paper
        seed={4}
        tension={0.8}
      />
      <Dots x={40} y={45} />
      <Shape
        points={bubblePoints(116, 62, 64, 36, 'right')}
        tone="lavender"
        paper
        seed={6}
        tension={0.8}
      />
      <Dots x={137} y={80} />
      <Shape
        points={bubblePoints(30, 116, 62, 36, 'left')}
        tone="sky"
        paper
        seed={8}
        tension={0.8}
      />
      <Dots x={50} y={134} />
      {/* The pen, still drawing, and the hand holding it. */}
      <Shape
        points={[
          [112, 124],
          [120, 118],
          [150, 146],
          [142, 152]
        ]}
        tone="lavender"
        paper
        seed={10}
        jitter={0.4}
        tension={0.4}
      />
      <Ink
        seed={11}
        jitter={0.3}
        points={[
          [112, 124],
          [104, 116],
          [120, 118]
        ]}
        tension={0.2}
      />
      <Hand x={162} y={166} angle={-135} sleeve="lavender" stripes seed={14} />
      <Ticks x={96} y={128} angle={160} length={8} gap={6} />
    </IllustrationFrame>
  )
}
