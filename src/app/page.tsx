import { JsonLd } from '@/components/json-ld'
import { ProfileCard } from '@/components/site/profile-card'
import { ProjectCard } from '@/components/site/project-card'
import { Container, Section } from '@/components/site/section'
import { PROFILE, PROJECTS } from '@/content/profile'
import { personJsonLd } from '@/lib/machine'

export default function Home() {
  // Jackson is writing the About; until then the intro line (from his resume) stands in.
  const about = PROFILE.about ? PROFILE.about.split(/\n\s*\n/) : [PROFILE.intro]

  return (
    <>
      <JsonLd data={personJsonLd()} />

      <section aria-label="About" className="pt-10 pb-4 sm:pt-14">
        <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <ProfileCard />
          <div className="min-w-0 lg:pt-4">
            <h2 className="text-title sm:text-headline">About</h2>
            <div className="mt-6 max-w-2xl space-y-5 text-lg text-pretty text-foreground/85 sm:text-lede">
              {about.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Section id="projects" className="py-12 sm:py-16">
        <h2 className="sr-only">Projects</h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
