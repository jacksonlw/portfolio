import React from 'react'

type Props = {
  Icon: React.FC<React.ComponentProps<'svg'>>
  title: string
  desc: string
}

function ProjectCard({ Icon, title, desc }: Props) {
  return (
    <div className="rounded-lg border border-neutral-400 px-10 py-8">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-200">
        <Icon className="h-8 w-8 text-black" />
      </div>
      <h3 className="mb-3 text-xl font-medium sm:text-2xl">{title}</h3>
      <p className="font-meidum text-base text-neutral-600 sm:text-lg">
        {desc}
      </p>
    </div>
  )
}

export default ProjectCard
