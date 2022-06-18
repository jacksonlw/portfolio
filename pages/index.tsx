import {
  AcademicCapIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  LightBulbIcon,
  LightningBoltIcon,
} from "@heroicons/react/outline";
import type { NextPage } from "next";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ServiceCard from "../components/ServiceCard";

const Home: NextPage = () => {
  return (
    <div>
      <Navbar />
      <div className="pt-24 mx-auto max-w-[1500px] px-8">
        <div className="flex justify-between items-center mt-24">
          <h1 className="text-7xl font-medium overflow-hidden tracking-tight">
            Developer
          </h1>
          <div>
            <h2 className="text-2xl font-medium text-neutral-400 max-w-xl">
              I am Jackson Lawrence, a web and mobile developer based out of
              Boston.
            </h2>
            <button className="flex items-center justify-center mt-4">
              <p className="text-xl font-medium mr-2">Check out my Resume</p>
              <ArrowRightIcon className="w-6 h-6 mt-[-2px]" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 w-full mt-48">
          <ProjectCard
            img="grindstone-mockup-2.png"
            title="Grindstone"
            desc="Jobs for the next generation"
            imgType="mobile"
          />
          <ProjectCard
            img="tedx-mockup-2.png"
            title="TEDx Design Tech High School"
            desc="Sell and manage tickets for high school TEDx event"
            imgType="web"
          />
          <ProjectCard
            img="markdown-mockup-2.png"
            title="Markdown"
            desc="Find better prices while shopping online"
            imgType="web"
          />
          <ProjectCard
            img="branch-mockup.png"
            title="Branch"
            desc="Smart school prototype presented at Oracle OpenWorld 2019"
            imgType="web"
          />
        </div>
        <div className="mt-60">
          <h1 className="text-7xl font-medium overflow-hidden tracking-tight">
            Services
          </h1>
          <div className="mt-24 grid grid-cols-2 gap-x-5">
            <ServiceCard
              Icon={LightBulbIcon}
              title="Tutoring"
              desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Posuere ac ut consequat semper viverra. Nisl nisi scelerisque eu ultrices vitae auctor. Nunc sed augue lacus viverra. Tellus id interdum velit laoreet."
            />
            <ServiceCard
              Icon={LightningBoltIcon}
              title="Freelancing"
              desc="Consectetur adipiscing elit duis tristique sollicitudin nibh. Magna sit amet purus gravida quis blandit. Erat velit scelerisque in dictum non consectetur a. Dignissim diam quis enim lobortis scelerisque fermentum dui. Sed egestas egestas fringilla phasellus faucibus scelerisque. Nam libero justo laoreet sit amet."
            />
          </div>
        </div>
        <div className="mt-60">
          <h1 className="text-7xl font-medium overflow-hidden tracking-tight">
            About
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
