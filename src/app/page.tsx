import { JsonLd } from '@/components/json-ld'
import { SkillsConstellation } from '@/components/skills/constellation'
import { ReadMore } from '@/components/site/read-more'
import { ProfileCard } from '@/components/site/profile-card'
import { ProjectCard } from '@/components/site/project-card'
import { Container, Section } from '@/components/site/section'
import { PROFILE, PROJECTS, SKILLS } from '@/content/profile'
import { personJsonLd } from '@/lib/machine'

export default function Home() {
  return (
    <>
      <JsonLd data={personJsonLd()} />

      <section aria-label="About" className="pt-16 pb-4 sm:pt-24">
        <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <ProfileCard />
          <div className="min-w-0 lg:pt-6">
            <h2 className="sr-only">About</h2>
            <div className="max-w-2xl space-y-5 text-xl leading-relaxed text-pretty sm:text-2xl sm:leading-relaxed">
              {PROFILE.about.lead.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <ReadMore className="mt-5 max-w-2xl">
              {PROFILE.about.more.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </ReadMore>
          </div>
        </Container>
      </section>

      <Section id="projects" className="py-12 sm:py-16">
        <h2 className="sr-only">Projects</h2>
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="skills"
        size="full"
        title="Skills"
        description="Hover a skill to see the projects it went into, or a project to see what it was built with."
      >
        <SkillsConstellation skills={SKILLS} projects={PROJECTS} />
      </Section>
    </>
  )
}
