import {
  AcademicCapIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  LightBulbIcon,
  LightningBoltIcon
} from '@heroicons/react/outline'
import type { NextPage } from 'next'
import Head from 'next/head'
import Heading from '../components/Heading'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import ServiceCard from '../components/ServiceCard'
import ShowOnScroll from '../components/ShowOnScroll'
import { PROJECTS, SERVICES, SKILLS } from '../utils/content'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Jackson Lawrence</title>
      </Head>
      <Navbar />
      <div className="mx-auto max-w-[1440px] py-24 px-8 2xl:px-0">
        <ShowOnScroll className="mt-24 xl:flex xl:items-center xl:justify-between">
          <Heading text="Web Developer" />
          <div className="mt-10 max-w-lg xl:mt-0">
            <h2 className="text-xl font-medium text-neutral-400 sm:text-2xl">
              I am Jackson Lawrence, a web and mobile developer based out of
              Boston, MA.
            </h2>
            <a
              className="justify-left mt-4 flex cursor-pointer items-center"
              target="_blank"
              href="/resume.pdf"
            >
              <p className="mr-2 text-xl font-medium">Check out my Resume</p>
              <ArrowRightIcon className="mt-[-2px] h-6 w-6" />
            </a>
          </div>
        </ShowOnScroll>
        <div className="mt-24 grid w-full grid-cols-1 gap-y-10 lg:mt-48 lg:grid-cols-2 lg:gap-x-5">
          {PROJECTS.map((p, i) => (
            <ShowOnScroll key={i} delay={0.2}>
              <ProjectCard
                img={p.img}
                title={p.title}
                desc={p.desc}
                imgType={p.imgType}
                url={p.url}
              />
            </ShowOnScroll>
          ))}
        </div>
        <div className="mt-36 sm:mt-60">
          <ShowOnScroll>
            <Heading text="Services" />
          </ShowOnScroll>
          <div className="mt-16 grid grid-cols-1 gap-y-10 sm:mt-24 lg:grid-cols-2 lg:gap-y-0 lg:gap-x-5">
            {SERVICES.map((s, i) => (
              <ShowOnScroll key={i} delay={0.2}>
                <ServiceCard Icon={s.Icon} title={s.title} desc={s.desc} />
              </ShowOnScroll>
            ))}
          </div>
        </div>
        <ShowOnScroll className="mt-36 sm:mt-60 lg:flex lg:items-center lg:justify-between">
          <Heading text="Skills" />
          <div className="mt-10 w-full rounded-lg bg-[rgba(255,255,255,0.05)] p-8 lg:mt-0 lg:max-w-2xl">
            {SKILLS.map((s, i) => (
              <div
                className={`flex items-center ${
                  i < SKILLS.length - 1 ? 'mb-8' : 'mb-0'
                }`}
                key={i}
              >
                <p className="w-36 shrink-0 text-lg font-medium">{s.name}</p>
                <div className="h-3 w-full rounded-full bg-[rgba(255,255,255,0.05)]">
                  <div
                    className={`h-full rounded-full`}
                    style={{
                      width: s.percentage + '%',
                      backgroundColor: s.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </ShowOnScroll>
      </div>
    </div>
  )
}

export default Home
