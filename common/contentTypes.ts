import { SVGProps } from 'react'

export type Project = {
  img: string
  title: string
  desc: string
  imgType: 'mobile' | 'web'
  url: string
}

export type Service = {
  Icon: React.FC<SVGProps<SVGSVGElement>>
  title: string
  desc: string
}

export type Skill = {
  name: string
  percentage: number
  color: string
}
