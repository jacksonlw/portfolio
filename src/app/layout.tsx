import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ChatbotSlot } from '@/components/chatbot/chatbot-slot'
import { Footer } from '@/components/site/footer'
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
  themeColor: '#FFFFFF'
}

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
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatbotSlot />
      </body>
    </html>
  )
}
