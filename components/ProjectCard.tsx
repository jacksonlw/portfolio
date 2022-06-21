/* eslint-disable @next/next/no-img-element */
import React from "react";

type Props = {
  img: string;
  title: string;
  desc: string;
  imgType: "mobile" | "web";
  url: string;
};

function ProjectCard({ title, desc, img, imgType, url }: Props) {
  const imgURL: string = `url(/${img})`;
  return (
    <a className="group cursor-pointer" href={url} target="_blank">
      <div
        className={`aspect-video w-full group-hover:bg-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] transition rounded-lg flex items-center justify-center`}
      >
        <img
          className={`${
            imgType === "mobile" ? "h-4/6 ml-[-5%]" : "h-5/6"
          } bg-cover bg-no-repeat bg-center`}
          src={`/${img}`}
          alt={`${title} Image`}
        />
      </div>
      <h3 className="sm:text-xl mt-4 text-lg font-medium">{title}</h3>
      <p className="sm:text-lg text-neutral-400 text-base font-medium">
        {desc}
      </p>
    </a>
  );
}

export default ProjectCard;
