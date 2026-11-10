/*
 * The illustrations: one spare line glyph per subject on a 48-unit square, drawn in chrome by
 * chrome.tsx (and in other finishes by the dev illustration lab).
 */

export type Pt = readonly [number, number]

export type Glyph = {
  /** Stroked paths (SVG path data, 48-unit square). */
  paths: string[]
  /** Paths that also read as solid shapes, for treatments that fill. */
  solids?: string[]
  /** Small round nodes (cx, cy, r): ends of a branch, a lens, a record's hole. */
  dots?: [number, number, number][]
  /** The glyph's key points, where the constellation treatment puts its stars. */
  stars: Pt[]
}

export const GLYPHS: Record<string, Glyph> = {
  resume: {
    paths: [
      'M14 8h14l8 8v22a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z',
      'M28 8v8h8',
      'M17 23h14',
      'M17 28h14',
      'M17 33h8'
    ],
    solids: [
      'M14 8h14l8 8v22a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z'
    ],
    stars: [
      [12, 8],
      [28, 8],
      [36, 16],
      [36, 40],
      [12, 40],
      [31, 23],
      [25, 33]
    ]
  },
  email: {
    paths: [
      'M10 13h28a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z',
      'M9 15l15 11 15-11'
    ],
    solids: [
      'M10 13h28a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z'
    ],
    stars: [
      [8, 13],
      [40, 13],
      [40, 35],
      [8, 35],
      [24, 26]
    ]
  },
  github: {
    paths: ['M16 13v22', 'M32 17c0 9-16 7-16 16'],
    dots: [
      [16, 10, 3.5],
      [16, 38, 3.5],
      [32, 14, 3.5]
    ],
    stars: [
      [16, 10],
      [16, 38],
      [32, 14],
      [24, 25]
    ]
  },
  press: {
    paths: [
      'M12 9h24a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z',
      'M15 15h18',
      'M15 21h8v8h-8z',
      'M27 22h6',
      'M27 26h6',
      'M15 34h18'
    ],
    solids: [
      'M12 9h24a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z'
    ],
    stars: [
      [10, 9],
      [38, 9],
      [38, 39],
      [10, 39],
      [15, 15],
      [33, 15]
    ]
  },
  oracle: {
    paths: [
      'M11 13c0-2.5 5.8-4.5 13-4.5s13 2 13 4.5-5.8 4.5-13 4.5-13-2-13-4.5z',
      'M11 13v22c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5V13',
      'M11 24c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5'
    ],
    solids: [
      'M11 13c0-2.5 5.8-4.5 13-4.5s13 2 13 4.5v22c0 2.5-5.8 4.5-13 4.5s-13-2-13-4.5z'
    ],
    stars: [
      [11, 13],
      [37, 13],
      [11, 35],
      [37, 35],
      [24, 8.5],
      [24, 39.5]
    ]
  },
  careerfoundry: {
    paths: [
      'M11 10h26a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z',
      'M17 32l-4 8',
      'M31 32l4 8',
      'M20 17l-4 4 4 4',
      'M28 17l4 4-4 4',
      'M25.5 16l-3 10'
    ],
    solids: [
      'M11 10h26a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z'
    ],
    stars: [
      [9, 10],
      [39, 10],
      [39, 32],
      [9, 32],
      [13, 40],
      [35, 40]
    ]
  },
  tedx: {
    paths: [
      'M9 15h30v6a3 3 0 0 0 0 6v6H9v-6a3 3 0 0 0 0-6z',
      'M31 16v2M31 22v4M31 30v2',
      'M14 21h11',
      'M14 26h7'
    ],
    solids: ['M9 15h30v6a3 3 0 0 0 0 6v6H9v-6a3 3 0 0 0 0-6z'],
    stars: [
      [9, 15],
      [39, 15],
      [39, 33],
      [9, 33],
      [31, 24]
    ]
  },
  trailblaze: {
    paths: [
      'M6 38l12-17 7 9 5-6 12 14z',
      'M30 24V10l7 3-7 3',
      'M15 38c3-3 7-4 9-8'
    ],
    solids: ['M6 38l12-17 7 9 5-6 12 14z'],
    stars: [
      [6, 38],
      [18, 21],
      [25, 30],
      [30, 24],
      [42, 38],
      [30, 10],
      [37, 13]
    ]
  },
  koistream: {
    paths: [
      'M12 13h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z',
      'M30 18l8-4v12l-8-4',
      'M20 27v13',
      'M20 27l-7 13',
      'M20 27l7 13'
    ],
    solids: [
      'M12 13h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z'
    ],
    dots: [[16, 20, 2.5]],
    stars: [
      [10, 13],
      [30, 13],
      [38, 14],
      [38, 26],
      [13, 40],
      [27, 40],
      [20, 27]
    ]
  },
  branch: {
    paths: [
      'M8 22l16-11 16 11',
      'M11 21v17h26V21',
      'M21 38v-8h6v8',
      'M24 17v2'
    ],
    solids: ['M8 22l16-11 16 11v16H8z'],
    stars: [
      [8, 22],
      [24, 11],
      [40, 22],
      [11, 38],
      [37, 38]
    ]
  },
  anyform: {
    paths: [
      'M11 10h26a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z',
      'M8 16h32',
      'M20 21v10l8-5z',
      'M31 29l7 3-3 1-1 3z'
    ],
    solids: [
      'M11 10h26a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z'
    ],
    dots: [
      [11.5, 13, 0.9],
      [14.5, 13, 0.9]
    ],
    stars: [
      [8, 10],
      [40, 10],
      [40, 36],
      [8, 36],
      [20, 21],
      [28, 26],
      [38, 32]
    ]
  },
  cratest: {
    paths: ['M14 17a10 10 0 1 1 20 0', 'M10 25h28v13H10z', 'M10 31.5h28'],
    solids: ['M14 17a10 10 0 1 1 20 0z', 'M10 25h28v13H10z'],
    dots: [[24, 17, 2.5]],
    stars: [
      [14, 17],
      [34, 17],
      [24, 7],
      [10, 25],
      [38, 25],
      [10, 38],
      [38, 38]
    ]
  },
  waltz: {
    paths: [
      'M8 38V24l8-6v6l8-6v6l8-6v20',
      'M32 38V10h5v28',
      'M6 38h36',
      'M13 31h3M21 31h3'
    ],
    solids: ['M8 38V24l8-6v6l8-6v6l8-6V10h5v28z'],
    stars: [
      [8, 24],
      [16, 18],
      [24, 18],
      [32, 18],
      [32, 10],
      [37, 10],
      [42, 38],
      [6, 38]
    ]
  }
}
