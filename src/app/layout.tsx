import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ChatbotSlot } from '@/components/chatbot/chatbot-slot'
import { ThemeToggle } from '@/components/site/theme-toggle'
import { PROFILE } from '@/content/profile'

// The AnyForm brand typeface and its mono companion (OFL; licences beside the files in ./fonts).
// Variable on every axis; ROND (roundness) stays at its default, 0.
const flex = localFont({
  src: './fonts/GoogleSansFlex.woff2',
  variable: '--font-flex',
  weight: '100 1000',
  display: 'swap'
})
const code = localFont({
  src: './fonts/GoogleSansCode.woff2',
  variable: '--font-code',
  weight: '300 800',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.url),
  title: {
    default: `${PROFILE.name} · ${PROFILE.role}`,
    template: `%s · ${PROFILE.name}`
  },
  description: PROFILE.description,
  authors: [{ name: PROFILE.name, url: PROFILE.url }],
  creator: PROFILE.name,
  openGraph: {
    type: 'profile',
    siteName: PROFILE.name,
    title: `${PROFILE.name} · ${PROFILE.role}`,
    description: PROFILE.description,
    url: '/',
    locale: 'en_US',
    firstName: 'Jackson',
    lastName: 'Lawrence'
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.name} · ${PROFILE.role}`,
    description: PROFILE.description
  },
  // Point agents at the machine-readable views of the same content.
  alternates: {
    types: {
      'text/plain': '/llms.txt',
      'application/json': '/profile.json'
    }
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#040507' }
  ]
}

/**
 * Picks light or dark before the page paints, so there's no flash: the visitor's own choice if
 * they've switched before, else their system's. It also marks low-end devices (4 cores or fewer,
 * 4GB of memory or less, or data saver on; or ?lite=1 to try it) with .lite, which lightens the
 * intro and the motion (globals.css).
 */
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme'),d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches,e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light'}catch(_){}try{var n=navigator,c=n.connection;if((n.hardwareConcurrency||8)<=4||(n.deviceMemory||8)<=4||(c&&c.saveData)||/[?&]lite=1/.test(location.search))document.documentElement.classList.add('lite')}catch(_){}`

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: browser extensions (Grammarly and the like) add attributes to
    // <html> and <body> before React loads. It only covers these two elements' own attributes.
    <html
      lang="en"
      className={`${flex.variable} ${code.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline on purpose, so it runs before the first paint (no flash of the wrong theme).
            React warns about script tags in development; it's harmless here. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <main className="flex-1">{children}</main>
        <ThemeToggle />
        <ChatbotSlot />
      </body>
    </html>
  )
}
