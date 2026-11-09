import { PROFILE } from '@/content/profile'
import { Container } from './section'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <Container className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {PROFILE.name} · {PROFILE.location}
        </p>
        <a
          href={`mailto:${PROFILE.email}`}
          className="rounded-sm text-link underline-offset-4 focus-ring hover:underline"
        >
          {PROFILE.email}
        </a>
      </Container>
    </footer>
  )
}
