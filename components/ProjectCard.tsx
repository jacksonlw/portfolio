/* eslint-disable @next/next/no-img-element */
import React from 'react'

type Props = {
  img: string
  title: string
  desc: string
  imgType: 'mobile' | 'web'
  url: string
}

function ProjectCard({ title, desc, img, imgType, url }: Props) {
  const imgURL: string = `url(/${img})`
  return (
    <a
      className="group cursor-pointer"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-lg bg-[rgba(255,255,255,0.05)] transition group-hover:bg-[rgba(255,255,255,0.08)]`}
      >
        <img
          className={`${
            imgType === 'mobile' ? 'ml-[-5%] h-4/6' : 'h-5/6'
          } bg-cover bg-center bg-no-repeat`}
          src={`/${img}`}
          alt={`${title} Image`}
        />
      </div>
      <h3 className="mt-4 text-lg font-medium sm:text-xl">{title}</h3>
      <p className="text-base font-medium text-neutral-400 sm:text-lg">
        {desc}
      </p>
    </a>
  )
}

export default ProjectCard
