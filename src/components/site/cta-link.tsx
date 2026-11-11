import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const VARIANTS = {
  /** An ink pill (a white pill on ink bands) that turns brand blue on hover. */
  primary:
    'bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground',
  /** An outlined pill that fills light grey and darkens its line on hover; clear on ink bands. */
  secondary:
    'border-foreground/30 bg-card text-foreground hover:border-foreground/60 hover:bg-muted dark:border-foreground/30 dark:bg-transparent dark:hover:border-foreground/60 dark:hover:bg-foreground/5',
  /** Text only, for quiet links in the header. */
  ghost: 'text-foreground hover:bg-muted'
} as const

const SIZES = {
  default: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-base'
} as const

const isExternal = (href: string) =>
  /^(https?:|mailto:)/.test(href) || href.endsWith('.pdf')

/**
 * A link styled as a pill button, after the AnyForm marketing CTA: next/link for site paths, a
 * plain anchor otherwise (new tab unless mailto:). `arrow` adds a bold trailing arrow (↗ when
 * external) that nudges on hover.
 */
export function CtaLink({
  href,
  variant = 'primary',
  size = 'lg',
  arrow = false,
  className,
  children
}: {
  href: string
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  arrow?: boolean
  className?: string
  children: ReactNode
}) {
  const external = isExternal(href)
  const Icon = external ? ArrowUpRightIcon : ArrowRightIcon
  const classes = cn(
    'group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent font-semibold whitespace-nowrap transition-[color,background-color,border-color] focus-ring',
    VARIANTS[variant],
    SIZES[size],
    className
  )
  const body = (
    <>
      {children}
      {arrow && (
        <Icon
          weight="bold"
          aria-hidden
          className={cn(
            'size-4.5 transition-transform duration-200 motion-reduce:transition-none',
            external
              ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
              : 'group-hover:translate-x-0.5'
          )}
        />
      )}
    </>
  )
  if (!external) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    )
  }
  return (
    <a
      href={href}
      className={classes}
      {...(href.startsWith('mailto:')
        ? {}
        : { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {body}
    </a>
  )
}
