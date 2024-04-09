import { ArrowRightIcon } from '@heroicons/react/outline'
import type { NextPage } from 'next'
import Head from 'next/head'
import Heading from '../components/Heading'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import ServiceCard from '../components/ServiceCard'
import { PROJECTS, SERVICES, SKILLS } from '../common/content'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Jackson Lawrence</title>
      </Head>
      <Navbar />
      <div className="mx-auto max-w-[1440px] px-8 py-24 2xl:px-0">
        <div className="mt-24 xl:flex xl:items-center xl:justify-between">
          <Heading text="Software Engineer" />
          <div className="mt-10 max-w-xl xl:mt-0">
            <h2 className="text-xl sm:text-2xl">
              I am Jackson Lawrence, a software engineer & college student based
              out of Boston, MA.
            </h2>
            <a
              className="justify-left group mt-4 flex w-fit cursor-pointer items-center"
              target="_blank"
              href="/resume.pdf"
            >
              <p className="mr-2 text-xl font-medium text-blue-600 group-hover:underline">
                Check out my resume
              </p>
              <ArrowRightIcon className="mt-[-2px] h-6 w-6 -rotate-45 text-blue-600" />
            </a>
          </div>
        </div>
        <div className="mt-24 grid w-full grid-cols-1 gap-y-10 lg:mt-48 lg:grid-cols-2 lg:gap-x-5">
          {PROJECTS.map((p, i) => (
            <div key={i}>
              <ProjectCard
                img={p.img}
                title={p.title}
                desc={p.desc}
                imgType={p.imgType}
                url={p.url}
              />
            </div>
          ))}
        </div>
        <div className="mt-36 sm:mt-60">
          <div>
            <Heading text="Services" />
          </div>
          <div className="mt-16 grid grid-cols-1 gap-y-10 sm:mt-24 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-0">
            {SERVICES.map((s, i) => (
              <div key={i}>
                <ServiceCard Icon={s.Icon} title={s.title} desc={s.desc} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-36 sm:mt-60 lg:flex lg:items-center lg:justify-between">
          <Heading text="Skills" />
          <div className="mt-10 w-full rounded-lg border border-neutral-400 p-8 lg:mt-0 lg:max-w-2xl">
            {SKILLS.map((s, i) => (
              <div
                className={`flex items-center ${
                  i < SKILLS.length - 1 ? 'mb-8' : 'mb-0'
                }`}
                key={i}
              >
                <p className="w-36 shrink-0 text-lg font-medium">{s.name}</p>
                <div className="h-3 w-full rounded-full bg-neutral-200">
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
        </div>
      </div>
    </div>
  )
}

export default Home
