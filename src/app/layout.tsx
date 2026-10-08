import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
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
  title: { default: PROFILE.name, template: `%s · ${PROFILE.name}` },
  description: PROFILE.intro,
  openGraph: {
    type: 'profile',
    siteName: PROFILE.name,
    title: PROFILE.name,
    description: PROFILE.intro,
    url: '/',
    locale: 'en_US'
  }
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF'
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${flex.variable} ${code.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
