# Sketch illustrations (pilot)

The next illustration style: loose, hand-drawn ink with flat pastel colour printed slightly off
register. It replaces the crisp badge grammar (ruler-straight objects, hard +4 shadow, melt swash,
sparkles, status discs) once the pilot is approved, first here and then in `~/anyform`.

Drawn from inspiration only; every piece is original and tells Jackson's story.

## Grammar

- **Ink.** One dark line, 2.75 units at a 200-unit frame, round caps and joins, never a ruler
  line: every stroke runs through a smooth curve (Catmull-Rom) with a small seeded wobble, so it
  looks drawn but renders the same every time. Long continuous strokes beat many short ones.
- **Off-register colour.** Colour is a flat shape with no outline, drawn under the ink and offset
  by about +5, +4, so a sliver of paper shows on one side and colour spills on the other. Colour
  never fills an ink shape exactly.
- **Two pastels per piece.** The subject's own accent (the project's or area's colour) plus one
  supporting pastel. Ink and paper do the rest; leave plenty of white.
- **Objects and hands.** An object doing its job, with a hand or arm in the action: holding,
  pointing, drawing, carrying. Hands are paper with an ink outline; sleeves take a pastel and may
  be striped.
- **One or two extras.** A loose squiggle, motion ticks or a small burst, to suggest movement.
  No sparkles, status discs, hard shadows or swashes.
- **Readable small.** Every piece must still read at 72 px (the smallest constellation bubble);
  the frame thickens the ink as it shrinks. If detail turns to mush, simplify the piece.

## Building blocks (`primitives.tsx`)

| Piece                        | What                                                                       |
| ---------------------------- | -------------------------------------------------------------------------- |
| `Ink`                        | An open or closed stroke through points, smoothed and wobbled              |
| `Fill`                       | A closed colour shape through points, offset off register, no outline      |
| `Shape`                      | A `Fill` and its `Ink` outline together (the common case)                  |
| `Hand`                       | A hand on a short floating sleeve, scalloped fingers, placed by wrist and angle |
| `Squiggle`, `Ticks`, `Burst` | The extras                                                                 |

Frames are 200 × 200 (`kind="sketch"`). Colours are the brand classes (`ill-f-*`, `ill-s`), so
dark mode keeps working.
