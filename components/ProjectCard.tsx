/* eslint-disable @next/next/no-img-element */

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
        className={`flex aspect-video w-full items-center justify-center rounded-lg border-2 border-transparent bg-neutral-200 transition group-hover:bg-neutral-300`}
      >
        <img
          className={`${
            imgType === 'mobile' ? 'ml-[-5%] h-4/6' : 'h-5/6'
          } bg-cover bg-center bg-no-repeat`}
          src={`/${img}`}
          alt={`${title} Image`}
        />
      </div>
      <h3 className="mt-4 text-xl font-medium transition group-hover:text-blue-600 sm:text-xl">
        {title}
      </h3>
      <p className="text-base text-neutral-600 sm:text-lg">{desc}</p>
    </a>
  )
}

export default ProjectCard
