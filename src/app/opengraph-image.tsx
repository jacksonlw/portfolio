import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { PROFILE } from '@/content/profile'

/*
 * The share card for links to the site, in the site's dark theme: your photo in the same
 * iridescent chrome rim it has on the page, then your name, role and the address. Rendered once
 * at build.
 */
export const alt = `${PROFILE.name}, ${PROFILE.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** The photo's diameter, and the chrome rim's width around it. */
const PHOTO = 300
const RIM = 9

/** The chrome rim (globals.css --chrome-rim, as a linear sweep: satori has no conic gradients). */
const CHROME =
  'linear-gradient(135deg, #f8f9fb, #b9a6ff 20%, #eceef2 38%, #7fd6f0 56%, #f3c1e6 72%, #f6e7a6 86%, #8b919b)'

export default async function OpenGraphImage() {
  const photo = await readFile(join(process.cwd(), 'public', PROFILE.photo))
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 72,
        padding: '0 110px',
        // The page's dark background: lit softly behind the photo, falling off to night.
        backgroundImage:
          'radial-gradient(ellipse 110% 100% at 32% 50%, #1c1e24 0%, #121317 40%, #0c0d10 75%, #08090b 100%)',
        color: '#e6e8ec',
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          padding: RIM,
          borderRadius: 9999,
          backgroundImage: CHROME
        }}
      >
        <img
          src={src}
          alt=""
          width={PHOTO}
          height={PHOTO}
          style={{
            borderRadius: 9999,
            border: '3px solid #0c0d10',
            objectFit: 'cover',
            objectPosition: '62% 22%'
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}
        >
          {PROFILE.name}
        </div>
        <div style={{ marginTop: 20, fontSize: 32, color: '#9aa0aa' }}>
          {`${PROFILE.role} · ${PROFILE.location.split(',')[0]}`}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            fontSize: 28,
            fontWeight: 600,
            backgroundImage: CHROME,
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {PROFILE.url.replace('https://', '')}
        </div>
      </div>
    </div>,
    size
  )
}
