import { CaretDownIcon } from '@phosphor-icons/react/ssr'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * A native disclosure: the summary reads "Read more" and turns to "Show less" when open. The
 * content is in the HTML either way, so agents and search engines read all of it.
 */
export function ReadMore({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <details className={cn('group', className)}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-sm text-lg font-semibold text-link underline-offset-4 hover:underline focus-ring [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Read more</span>
        <span className="hidden group-open:inline">Show less</span>
        <CaretDownIcon
          weight="bold"
          aria-hidden
          className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="mt-5 space-y-5 text-xl leading-relaxed text-pretty sm:text-2xl sm:leading-relaxed">
        {children}
      </div>
    </details>
  )
}
