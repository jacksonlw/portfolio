import { MapPinIcon } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import { HERO_PHOTO_BOX, HeroArt } from '@/components/illustrations/hero'
import { PROFILE } from '@/content/profile'
import { cn } from '@/lib/cn'
import { SURFACE } from '@/lib/surface'
import photo from '../../../public/profile-picture.jpg'
import { CtaLink } from './cta-link'

/**
 * The home page's profile card: the photo over the hero art on a pastel panel, then the name, the
 * headline, the location and the two actions.
 */
export function ProfileCard({ className }: { className?: string }) {
  return (
    <div className={cn(SURFACE, 'p-4 sm:p-5', className)}>
      <div className="rounded-md bg-illo-lavender-tint px-6 py-8 sm:px-10">
        <div className="relative">
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
              sizes="(min-width: 1024px) 240px, 50vw"
              className="object-cover object-[62%_18%] scale-[1.35]"
            />
          </div>
        </div>
      </div>

      <div className="px-2 pt-6 pb-2 sm:px-3">
        <h1 className="text-title sm:text-headline">{PROFILE.name}</h1>
        <p className="mt-2 text-lg text-pretty text-muted-foreground">{PROFILE.headline}</p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon weight="bold" aria-hidden className="size-4" />
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
    </div>
  )
}
