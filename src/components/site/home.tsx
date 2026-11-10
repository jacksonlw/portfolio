import { JsonLd } from '@/components/json-ld'
import { Constellation } from '@/components/skills/constellation'
import { PROFILE, PROJECTS, SATELLITES, SKILLS, WORK } from '@/content/profile'
import { personJsonLd, stories } from '@/lib/machine'

/**
 * The whole page is the constellation, with Jackson at its center. A Story's address
 * (/projects/<slug>, /work/<slug>) is the same page with that Story already open.
 */
export function Home({ story }: { story?: string }) {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <h1 className="sr-only">
        {PROFILE.name}, {PROFILE.role}
      </h1>
      <Constellation
        skills={SKILLS}
        projects={PROJECTS}
        work={WORK}
        satellites={SATELLITES}
        stories={stories()}
        initialStory={story}
      />
    </>
  )
}
