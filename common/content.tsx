import { LightBulbIcon, LightningBoltIcon } from '@heroicons/react/outline'
import { Project, Service, Skill } from './contentTypes'

export const PROJECTS: Array<Project> = [
  {
    img: 'grindstone-mockup-2.png',
    title: 'Trailblaze',
    desc: 'Job opporutnities for the next generation of talent',
    imgType: 'mobile',
    url: 'https://trailblaze.to'
  },
  {
    img: 'koistream-mockup.png',
    title: 'Koistream',
    desc: 'Connecting students, staff, and families through community livestreams',
    imgType: 'web',
    url: 'https://github.com/JacksonL1787/koistream'
  },
  {
    img: 'tedx-mockup-2.png',
    title: 'TEDx Design Tech High School',
    desc: 'Sell and manage tickets for high school TEDx event',
    imgType: 'web',
    url: 'https://github.com/JacksonL1787/ticketing-tedxdesigntech'
  },
  {
    img: 'branch-mockup.png',
    title: 'Branch',
    desc: 'Smart school prototype presented at Oracle OpenWorld 2019',
    imgType: 'web',
    url: 'https://github.com/JacksonL1787/Branch'
  }
]

export const SERVICES: Array<Service> = [
  {
    Icon: LightBulbIcon,
    title: 'Tutoring',
    desc: "Working one-on-one with individuals of any age to provide them with the necessary skills to begin developing websites and mobile applications. Please reach out by email if you're interested in starting one-on-one sessions with me."
  },
  {
    Icon: LightningBoltIcon,
    title: 'Freelancing',
    desc: 'Working with clients to design, develop, and launch web and mobile applications. I mostly work on front end projects, however, I am open to working full stack as well. Please reach out by email if you are looking for help with a project.'
  }
]

export const SKILLS: Array<Skill> = [
  {
    name: 'Next.js',
    percentage: 90,
    color: '#1abc9c'
  },
  {
    name: 'React Native',
    percentage: 85,
    color: '#48dbfb'
  },
  {
    name: 'Typescript',
    percentage: 80,
    color: '#a55eea'
  },
  {
    name: 'SQL',
    percentage: 80,
    color: '#f39c12'
  },
  {
    name: 'UI/UX',
    percentage: 70,
    color: '#f368e0'
  },
  {
    name: 'Go',
    percentage: 60,
    color: '#27b8c5'
  }
]
