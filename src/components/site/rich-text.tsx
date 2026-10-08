import Link from 'next/link'
import { Fragment } from 'react'

/**
 * Renders the content's light markup: **bold** and [label](/path). Site paths use next/link.
 * Anything else is plain text.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/)
        if (bold)
          return (
            <strong key={i} className="font-semibold">
              {bold[1]}
            </strong>
          )
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link)
          return (
            <Link
              key={i}
              href={link[2]}
              className="rounded-sm font-medium text-link underline decoration-link/30 underline-offset-4 focus-ring transition-colors hover:decoration-link"
            >
              {link[1]}
            </Link>
          )
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
