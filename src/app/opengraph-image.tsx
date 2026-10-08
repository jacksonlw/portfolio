import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { PROFILE } from '@/content/profile'

// The share card for links to the site: photo, name, role and three pastel tags, in the brand's
// ink-on-white with a hard offset shadow. Rendered once at build.
export const alt = `${PROFILE.name}, ${PROFILE.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TAGS = [
  { label: 'AI agents in production', bg: '#E5EDFF', fg: '#1608AE' },
  { label: 'RAG and orchestration', bg: '#F5F1FF', fg: '#5F4193' },
  { label: 'Full-stack', bg: '#E1FAF0', fg: '#00654B' }
]

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
        gap: 64,
        padding: '0 88px',
        background: '#FFFFFF',
        color: '#0B0B0C',
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: 340,
          height: 340
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            width: 340,
            height: 340,
            borderRadius: 9999,
            background: '#0B0B0C'
          }}
        />
        <img
          src={src}
          alt=""
          width={340}
          height={340}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            borderRadius: 9999,
            border: '5px solid #0B0B0C',
            objectFit: 'cover',
            objectPosition: '62% 22%'
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1
          }}
        >
          {PROFILE.name}
        </div>
        <div style={{ marginTop: 18, fontSize: 30, color: '#5B6270' }}>
          {`${PROFILE.role} · ${PROFILE.location}`}
        </div>
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 40 }}
        >
          {TAGS.map((t) => (
            <div
              key={t.label}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 9999,
                border: '2px solid #0B0B0C',
                background: t.bg,
                color: t.fg,
                fontSize: 26,
                fontWeight: 600
              }}
            >
              {t.label}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            color: '#2B3BFF',
            fontWeight: 600
          }}
        >
          jlawrence.io
        </div>
      </div>
    </div>,
    size
  )
}
