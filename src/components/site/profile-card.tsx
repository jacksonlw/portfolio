import { MapPinIcon } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import { HERO_PHOTO_BOX, HeroArt } from '@/components/illustrations/hero'
import { PROFILE } from '@/content/profile'
import { cn } from '@/lib/cn'
import photo from '../../../public/profile-picture.jpg'
import { CtaLink } from './cta-link'

/**
 * The home page's profile: the photo over the hero art, then the name, the role and location
 * and the two actions. No frame; everything left-aligned.
 */
export function ProfileCard({ className }: { className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="relative -ml-3 w-full max-w-[17rem]">
        <HeroArt autoplay />
        <div
          className="absolute overflow-hidden rounded-full"
          style={{
            left: HERO_PHOTO_BOX.left,
            top: HERO_PHOTO_BOX.top,
            width: HERO_PHOTO_BOX.size,
            height: HERO_PHOTO_BOX.size
          }}
        >
          <Image
            src={photo}
            alt={`Portrait of ${PROFILE.name}`}
            fill
            priority
            placeholder="blur"
            sizes="160px"
            className="scale-[1.35] object-cover object-[62%_18%]"
          />
        </div>
      </div>

      <h1 className="mt-6 text-title sm:text-headline">{PROFILE.name}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg">
        <span>{PROFILE.role}</span>
        <span className="flex items-center gap-1.5">
          <MapPinIcon weight="bold" aria-hidden className="size-5" />
          {PROFILE.location}
        </span>
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
