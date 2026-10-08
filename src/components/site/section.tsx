import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const WIDTHS = {
  /** Reading width: prose. */
  narrow: 'max-w-3xl',
  /** The site's default content width. */
  default: 'max-w-6xl',
  /** Full-bleed grids. */
  wide: 'max-w-7xl'
} as const

export type ContainerSize = keyof typeof WIDTHS

/** Centres content at one of the site's widths, with the page gutter. */
export function Container({
  size = 'default',
  className,
  children
}: {
  size?: ContainerSize
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', WIDTHS[size], className)}
    >
      {children}
    </div>
  )
}

const TONES = {
  /** The page's own grey. */
  default: '',
  /** A white band between hairlines, to separate neighbouring sections. */
  white: 'border-y border-border bg-card',
  /** An ink band: `.dark` turns the whole subtree dark. */
  ink: 'dark bg-background text-foreground'
} as const

/** A big tight heading and an optional lede. The heading stands alone: no kicker above it. */
export function SectionHeading({
  title,
  description,
  as: Heading = 'h2',
  className
}: {
  title: ReactNode
  description?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <Heading
        className={cn(
          'text-balance',
          Heading === 'h1'
            ? 'text-headline sm:text-display'
            : Heading === 'h2'
              ? 'text-title sm:text-headline'
              : 'text-title'
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className="mt-5 text-lg text-pretty text-muted-foreground sm:text-lede">
          {description}
        </p>
      )}
    </div>
  )
}

/** A page band: vertical rhythm, a background tone and an optional heading block. */
export function Section({
  id,
  tone = 'default',
  size = 'default',
  title,
  description,
  className,
  children
}: {
  id?: string
  tone?: keyof typeof TONES
  size?: ContainerSize
  title?: ReactNode
  description?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={title && id ? `${id}-title` : undefined}
      className={cn('py-20 sm:py-28', TONES[tone], className)}
    >
      <Container size={size}>
        {title && (
          <div id={id ? `${id}-title` : undefined} className={children ? 'mb-12 sm:mb-16' : undefined}>
            <SectionHeading title={title} description={description} />
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
