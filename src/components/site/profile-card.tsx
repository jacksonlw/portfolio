import { MapPinIcon } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import { PROFILE } from '@/content/profile'
import { cn } from '@/lib/cn'
import photo from '../../../public/profile-picture.jpg'
import { CtaLink } from './cta-link'

/** The home page's profile: the photo, the name, the location and the two actions. */
export function ProfileCard({ className }: { className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="relative size-44 overflow-hidden rounded-full">
        <Image
          src={photo}
          alt={`Portrait of ${PROFILE.name}`}
          fill
          priority
          placeholder="blur"
          sizes="320px"
          className="origin-[82%_8%] scale-[1.6] object-cover object-top"
        />
      </div>

      <h1 className="mt-6 text-title sm:text-headline">{PROFILE.name}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-lg">
        <MapPinIcon weight="bold" aria-hidden className="size-5" />
        {PROFILE.location}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <CtaLink href={PROFILE.resume} arrow>
          Read my resume
        </CtaLink>
        <CtaLink href={`mailto:${PROFILE.email}`} variant="secondary">
          Contact me
        </CtaLink>
      </div>
    </div>
  )
}
