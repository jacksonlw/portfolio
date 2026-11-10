import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// The home-screen icon (iOS ignores SVG icons): icon.svg, drawn at 180px.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  // iOS rounds the corners itself, so the monogram goes on a square of the same night background.
  const svg = (
    await readFile(join(process.cwd(), 'src/app/icon.svg'), 'utf8')
  ).replace('rx="14"', 'rx="0"')
  return new ImageResponse(
    <img
      src={`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`}
      alt=""
      width={size.width}
      height={size.height}
    />,
    size
  )
}
