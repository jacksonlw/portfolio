import React from 'react'

type Props = {
  Icon: React.FC<React.ComponentProps<'svg'>>
  title: string
  desc: string
}

function ProjectCard({ Icon, title, desc }: Props) {
  return (
    <div className="rounded-lg border border-neutral-800 px-10 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white">
        <Icon className="h-8 w-8 text-black" />
      </div>
      <h3 className="mt-5 text-xl font-medium sm:text-2xl">{title}</h3>
      <p className="font-meidum mt-3 text-base text-neutral-400 sm:text-lg">
        {desc}
      </p>
    </div>
  )
}

export default ProjectCard
