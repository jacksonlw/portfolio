import { JsonLd } from '@/components/json-ld'
import { SkillsConstellation } from '@/components/skills/constellation'
import { RichText } from '@/components/site/rich-text'
import { ReadMore } from '@/components/site/read-more'
import { ProfileCard } from '@/components/site/profile-card'
import { Container } from '@/components/site/section'
import { PROFILE, PROJECTS, SKILLS, WORK } from '@/content/profile'
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
                <p key={i}>
                  <RichText text={para} />
                </p>
              ))}
            </div>
            <ReadMore className="mt-5 max-w-2xl">
              {PROFILE.about.more.map((para, i) => (
                <p key={i}>
                  <RichText text={para} />
                </p>
              ))}
            </ReadMore>
          </div>
        </Container>
      </section>

      <section id="skills" aria-labelledby="skills-title" className="pt-16 pb-20 sm:pt-20 sm:pb-28">
        {/* The heading keeps the page's width; the board below runs edge to edge. */}
        <Container className="mb-10 sm:mb-12">
          <h2 id="skills-title" className="text-2xl font-semibold tracking-[-0.02em]">
            Work, projects and skills
          </h2>
          <p className="mt-1.5 text-lg text-pretty text-muted-foreground">
            Hover anything to see how it connects. Click a project to read the full story.
          </p>
        </Container>
        <Container size="full">
          <SkillsConstellation skills={SKILLS} projects={PROJECTS} work={WORK} />
        </Container>
      </section>
    </>
  )
}
