import type { Drawing, Pt, Shape } from './render'

/*
 * Every drawing, as shapes on a 48 square (render.tsx draws them).
 * Satellites are keyed by kind, bubbles by slug. Every subject gets its own object and silhouette,
 * so no two read alike.
 */

/* ---------- helpers ---------- */

/** Points along an ellipse from angle `from` to `to` (radians; y grows downward). */
function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  n = 10
): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt
  })
}

const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: Shape['fill']
): Shape => ({
  t: 'line',
  closed: true,
  fill,
  pts: arc(cx, cy, rx, ry, 0, Math.PI * 2, 14).slice(0, -1)
})

/** A database cylinder: body, bottom curve, bands, and its top as a separate piece. */
function cylinder(
  cx: number,
  top: number,
  bottom: number,
  rx: number,
  ry: number,
  bands: number[],
  body: Shape['fill'],
  lid: Shape['fill']
): Shape[] {
  return [
    {
      t: 'line',
      closed: true,
      fill: body,
      pts: [
        [cx - rx, top],
        ...arc(cx, bottom, rx, ry, Math.PI, 0),
        [cx + rx, top],
        ...arc(cx, top, rx, ry, 0, Math.PI).slice(1)
      ]
    },
    ...bands.map((y): Shape => ({
      t: 'line',
      pts: arc(cx, y, rx, ry, Math.PI * 0.94, Math.PI * 0.06, 8)
    })),
    ellipse(cx, top, rx, ry, lid)
  ]
}

/* ---------- drawings ---------- */

export const DRAWINGS: Record<string, Drawing> = {
  /* ---------- satellites ---------- */

  resume: {
    label: 'A resume on a clipboard',
    accent: 'sun',
    keepLight: true,
    shapes: [
      { t: 'box', x: 9, y: 6, w: 30, h: 38, r: 3, fill: 'accent' },
      { t: 'box', x: 13, y: 11, w: 22, h: 30, fill: 'white' },
      { t: 'box', x: 18, y: 3, w: 12, h: 6, r: 2, fill: 'ink' },
      {
        t: 'line',
        bold: true,
        pts: [
          [16.5, 17],
          [26, 16.8]
        ]
      },
      {
        t: 'line',
        pts: [
          [16.5, 23],
          [31.5, 23.2]
        ]
      },
      {
        t: 'line',
        pts: [
          [16.5, 28],
          [29, 27.8]
        ]
      },
      {
        t: 'line',
        pts: [
          [16.5, 33],
          [31, 33.2]
        ]
      }
    ]
  },

  email: {
    label: 'A sealed envelope',
    accent: 'sky',
    shapes: [
      { t: 'box', x: 5, y: 12, w: 38, h: 26, r: 2, fill: 'paper' },
      {
        t: 'line',
        closed: true,
        fill: 'accent',
        pts: [
          [5.5, 12.5],
          [24, 27],
          [42.5, 12.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [6.5, 37],
          [19, 26.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [41.5, 37],
          [29, 26.5]
        ]
      }
    ]
  },

  github: {
    label: 'A branch merging back into the main line',
    accent: 'mint',
    shapes: [
      // The main line runs dot to dot and stops there; nothing pokes out past a dot.
      {
        t: 'line',
        pts: [
          [15, 9.5],
          [15, 38.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [15, 14.5],
          [19, 19],
          [27, 20.5],
          [33.2, 24.5],
          [27, 28.5],
          [19, 30],
          [15, 35]
        ]
      },
      { t: 'dot', cx: 15, cy: 9.5, r: 3.6, fill: 'paper' },
      { t: 'dot', cx: 33.2, cy: 24.5, r: 4, fill: 'paper' },
      { t: 'dot', cx: 15, cy: 38.5, r: 4.6, fill: 'accent' }
    ]
  },

  press: {
    label: 'A newspaper front page: nameplate, headline, photo and columns',
    accent: 'peach',
    shapes: [
      { t: 'box', x: 7, y: 4, w: 34, h: 40, r: 1, fill: 'paper' },
      { t: 'box', x: 10, y: 7.5, w: 28, h: 5.5, fill: 'ink' },
      {
        t: 'line',
        pts: [
          [10, 15.5],
          [38, 15.5]
        ]
      },
      { t: 'box', x: 10, y: 18, w: 28, h: 3, fill: 'accent' },
      { t: 'box', x: 10, y: 24, w: 13, h: 10, fill: 'accent' },
      {
        t: 'line',
        pts: [
          [10, 37],
          [23, 37]
        ]
      },
      {
        t: 'line',
        pts: [
          [10, 40],
          [20, 40]
        ]
      },
      {
        t: 'line',
        pts: [
          [26, 25],
          [38, 25]
        ]
      },
      {
        t: 'line',
        pts: [
          [26, 28.5],
          [38, 28.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [26, 32],
          [38, 32]
        ]
      },
      {
        t: 'line',
        pts: [
          [26, 35.5],
          [38, 35.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [26, 39],
          [34, 39]
        ]
      }
    ]
  },

  /* ---------- bubbles ---------- */

  oracle: {
    label: 'A database',
    accent: 'rose',
    shapes: cylinder(24, 11, 37, 15, 5.5, [20, 28.5], 'paper', 'accent')
  },

  careerfoundry: {
    label: 'A board on an easel with a lesson in code',
    accent: 'peach',
    shapes: [
      {
        t: 'line',
        pts: [
          [24, 3],
          [24, 8]
        ]
      },
      {
        t: 'line',
        pts: [
          [14, 36],
          [10, 45]
        ]
      },
      {
        t: 'line',
        pts: [
          [34, 36],
          [38, 45]
        ]
      },
      { t: 'box', x: 5, y: 8, w: 38, h: 28, r: 1.5, fill: 'paper' },
      {
        t: 'line',
        bold: true,
        pts: [
          [14, 16],
          [9.5, 21.5],
          [14, 27]
        ]
      },
      {
        t: 'line',
        pts: [
          [21, 28],
          [27, 15]
        ]
      },
      {
        t: 'line',
        bold: true,
        pts: [
          [34, 16],
          [38.5, 21.5],
          [34, 27]
        ]
      },
      { t: 'box', x: 9, y: 36, w: 30, h: 3.5, fill: 'accent' }
    ]
  },

  tedx: {
    label: 'An event ticket with a tear-off stub',
    accent: 'rose',
    shapes: [
      {
        t: 'line',
        closed: true,
        fill: 'paper',
        pts: [
          [4, 13],
          [44, 13],
          [44, 21],
          [41.5, 24],
          [44, 27],
          [44, 35],
          [4, 35],
          [4, 27],
          [6.5, 24],
          [4, 21]
        ]
      },
      {
        t: 'line',
        closed: true,
        fill: 'accent',
        pts: [
          [33, 13],
          [44, 13],
          [44, 21],
          [41.5, 24],
          [44, 27],
          [44, 35],
          [33, 35]
        ]
      },
      {
        t: 'line',
        pts: [
          [33, 15.5],
          [33, 17.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [33, 20.5],
          [33, 22.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [33, 25.5],
          [33, 27.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [33, 30.5],
          [33, 32.5]
        ]
      },
      {
        t: 'line',
        bold: true,
        pts: [
          [10, 19.5],
          [25, 19.2]
        ]
      },
      {
        t: 'line',
        pts: [
          [10, 24.5],
          [27, 24.7]
        ]
      },
      {
        t: 'line',
        pts: [
          [10, 29],
          [20, 28.8]
        ]
      }
    ]
  },

  trailblaze: {
    label: 'A trail up a mountain to a flag at the top',
    accent: 'ocean',
    shapes: [
      {
        t: 'line',
        closed: true,
        fill: 'paper',
        pts: [
          [2, 43],
          [18, 15],
          [26, 28],
          [33, 19],
          [46, 43]
        ]
      },
      {
        t: 'line',
        pts: [
          [12, 42],
          [15.5, 37.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [18, 34.5],
          [15.5, 30]
        ]
      },
      {
        t: 'line',
        pts: [
          [15.5, 26.5],
          [17.5, 21.5]
        ]
      },
      {
        t: 'line',
        pts: [
          [18, 15],
          [18, 4]
        ]
      },
      {
        t: 'line',
        closed: true,
        fill: 'accent',
        pts: [
          [18, 4],
          [28, 6.8],
          [18, 9.8]
        ]
      }
    ]
  },

  koistream: {
    label: 'A broadcast camera on a tripod',
    accent: 'lavender',
    shapes: [
      {
        t: 'line',
        pts: [
          [18, 30],
          [11, 45]
        ]
      },
      {
        t: 'line',
        pts: [
          [18, 30],
          [18, 45]
        ]
      },
      {
        t: 'line',
        pts: [
          [18, 30],
          [25, 45]
        ]
      },
      {
        t: 'line',
        pts: [
          [10, 13],
          [10, 8.5],
          [24, 8.5],
          [24, 13]
        ]
      },
      {
        t: 'line',
        closed: true,
        fill: 'accent',
        pts: [
          [30, 17],
          [43, 11],
          [43, 32],
          [30, 26]
        ]
      },
      { t: 'box', x: 5, y: 13, w: 26, h: 17, r: 2, fill: 'paper' },
      { t: 'box', x: 9, y: 17, w: 10, h: 7, r: 1, fill: 'white' }
    ]
  },

  branch: {
    label: 'A school building',
    accent: 'mint',
    shapes: [
      {
        t: 'line',
        closed: true,
        fill: 'paper',
        pts: [
          [4, 23],
          [24, 9],
          [44, 23],
          [44, 44],
          [4, 44]
        ]
      },
      { t: 'dot', cx: 24, cy: 19.5, r: 3, fill: 'white' },
      { t: 'box', x: 8, y: 27, w: 7, h: 7, fill: 'white' },
      { t: 'box', x: 33, y: 27, w: 7, h: 7, fill: 'white' },
      { t: 'box', x: 19, y: 30, w: 10, h: 14, fill: 'accent' }
    ]
  },

  anyform: {
    label: 'A session replay playing in a browser, a cursor on it',
    accent: 'sky',
    shapes: [
      { t: 'box', x: 4, y: 7, w: 40, h: 31, r: 2.5, fill: 'paper' },
      {
        t: 'line',
        pts: [
          [4.5, 13.5],
          [43.5, 13.5]
        ]
      },
      { t: 'dot', cx: 8.5, cy: 10.3, r: 1, fill: 'ink' },
      { t: 'dot', cx: 12, cy: 10.3, r: 1, fill: 'ink' },
      { t: 'dot', cx: 15.5, cy: 10.3, r: 1, fill: 'ink' },
      {
        t: 'line',
        closed: true,
        fill: 'accent',
        pts: [
          [18.5, 18],
          [29, 25],
          [18.5, 32]
        ]
      },
      {
        t: 'line',
        closed: true,
        fill: 'ink',
        pts: [
          [31, 28],
          [31, 42],
          [34.5, 38.6],
          [37, 44],
          [39.5, 43],
          [37, 37.6],
          [41.5, 37.6]
        ]
      }
    ]
  },

  cratest: {
    label: 'A record rising out of a crate',
    accent: 'sun',
    shapes: [
      { t: 'dot', cx: 24, cy: 17, r: 12, fill: 'ink' },
      { t: 'dot', cx: 24, cy: 17, r: 4.5, fill: 'accent' },
      { t: 'box', x: 5, y: 24, w: 38, h: 18, r: 2, fill: 'paper' },
      {
        t: 'line',
        pts: [
          [5.5, 30.5],
          [42.5, 30.5]
        ]
      },
      { t: 'box', x: 18, y: 34, w: 12, h: 4, r: 2, fill: 'white' }
    ]
  },

  waltz: {
    label: 'A factory with a sawtooth roof',
    accent: 'lavender',
    shapes: [
      { t: 'box', x: 35, y: 8, w: 7, h: 34, fill: 'accent' },
      {
        t: 'line',
        closed: true,
        fill: 'paper',
        pts: [
          [4, 42],
          [4, 24],
          [14, 17],
          [14, 24],
          [24, 17],
          [24, 24],
          [34, 17],
          [34, 24],
          [37, 24],
          [37, 42]
        ]
      },
      { t: 'box', x: 8, y: 30, w: 5, h: 5, fill: 'white' },
      { t: 'box', x: 18, y: 30, w: 5, h: 5, fill: 'white' },
      { t: 'box', x: 28, y: 30, w: 5, h: 5, fill: 'white' }
    ]
  }
}
