/* eslint-disable @next/next/no-img-element */
import React from "react";

type Props = {
  img: string;
  title: string;
  desc: string;
  imgType: "mobile" | "web";
};

function ProjectCard({ title, desc, img, imgType }: Props) {
  const imgURL: string = `url(/${img})`;
  return (
    <div className="group cursor-pointer">
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
      <h3 className="text-xl font-medium mt-4">{title}</h3>
      <p className="text-neutral-400 text-lg font-medium">{desc}</p>
    </div>
  );
}

export default ProjectCard;
