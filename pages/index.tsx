import {
  AcademicCapIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  LightBulbIcon,
  LightningBoltIcon,
} from "@heroicons/react/outline";
import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ServiceCard from "../components/ServiceCard";
import ShowOnScroll from "../components/ShowOnScroll";
import { PROJECTS, SERVICES, SKILLS } from "../utils/content";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Jackson Lawrence</title>
      </Head>
      <Navbar />
      <div className="py-24 mx-auto max-w-[1440px] px-8 2xl:px-0">
        <ShowOnScroll className="lg:flex lg:justify-between lg:items-center mt-24">
          <h1 className="sm:text-7xl overflow-hidden text-5xl font-medium tracking-tight">
            Developer
          </h1>
          <div className="lg:max-w-md xl:max-w-lg lg:mt-0 max-w-lg mt-10">
            <h2 className="sm:text-2xl text-neutral-400 text-xl font-medium">
              I am Jackson Lawrence, a web and mobile developer based out of
              Silicon Valley.
            </h2>
            <a
              className="justify-left flex items-center mt-4 cursor-pointer"
              target="_blank"
              href="/resume.pdf"
            >
              <p className="mr-2 text-xl font-medium">Check out my Resume</p>
              <ArrowRightIcon className="w-6 h-6 mt-[-2px]" />
            </a>
          </div>
        </ShowOnScroll>
        <div className="lg:grid-cols-2 lg:gap-x-5 gap-y-10 lg:mt-48 grid w-full grid-cols-1 mt-24">
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
            <h1 className="sm:text-7xl overflow-hidden text-5xl font-medium tracking-tight">
              Services
            </h1>
          </ShowOnScroll>
          <div className="sm:mt-24 lg:grid-cols-2 gap-y-10 lg:gap-y-0 lg:gap-x-5 grid grid-cols-1 mt-16">
            {SERVICES.map((s, i) => (
              <ShowOnScroll key={i} delay={0.2}>
                <ServiceCard Icon={s.Icon} title={s.title} desc={s.desc} />
              </ShowOnScroll>
            ))}
          </div>
        </div>
        <ShowOnScroll className="mt-36 sm:mt-60 lg:flex lg:justify-between lg:items-center">
          <h1 className="sm:text-7xl overflow-hidden text-5xl font-medium tracking-tight">
            Skills
          </h1>
          <div className="w-full p-8 bg-[rgba(255,255,255,0.05)] rounded-lg mt-10 lg:max-w-2xl lg:mt-0">
            {SKILLS.map((s, i) => (
              <div
                className={`flex items-center ${
                  i < SKILLS.length - 1 ? "mb-8" : "mb-0"
                }`}
                key={i}
              >
                <p className="w-36 shrink-0 text-lg font-medium">{s.name}</p>
                <div className="w-full h-3 bg-[rgba(255,255,255,0.05)] rounded-full">
                  <div
                    className={`h-full rounded-full`}
                    style={{
                      width: s.percentage + "%",
                      backgroundColor: s.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </ShowOnScroll>
      </div>
    </div>
  );
};

export default Home;
