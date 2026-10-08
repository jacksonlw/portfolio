import { JsonLd } from '@/components/json-ld'
import { CtaLink } from '@/components/site/cta-link'
import { ProjectCard } from '@/components/site/project-card'
import { Container, Section } from '@/components/site/section'
import { PROFILE, PROJECTS } from '@/content/profile'
import { personJsonLd } from '@/lib/machine'

export default function Home() {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <header className="border-b border-border bg-card py-20 sm:py-28">
        <Container>
          <h1 className="text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-display lg:text-display-xl">
            {PROFILE.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-lede">
            {PROFILE.intro}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <CtaLink href={PROFILE.resume} arrow>
              Read my resume
            </CtaLink>
            <CtaLink href={`mailto:${PROFILE.email}`} variant="secondary">
              Get in touch
            </CtaLink>
          </div>
        </Container>
      </header>

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
