import Link from 'next/link'
import { PROFILE } from '@/content/profile'
import { CtaLink } from './cta-link'

/** A white bar over a hairline: the name (home) on the left, resume and email on the right. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="rounded-sm text-base font-semibold tracking-[-0.01em] focus-ring"
        >
          {PROFILE.name}
        </Link>
        <nav aria-label="Primary" className="ml-auto flex items-center gap-2">
          <CtaLink
            href={PROFILE.resume}
            variant="secondary"
            size="default"
            className="hidden sm:inline-flex"
          >
            Resume
          </CtaLink>
          <CtaLink href={`mailto:${PROFILE.email}`} size="default">
            Email me
          </CtaLink>
        </nav>
      </div>
    </header>
  )
}
