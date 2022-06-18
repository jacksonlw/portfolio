import React from "react";

type Props = {
  Icon: React.FC<React.ComponentProps<"svg">>;
  title: string;
  desc: string;
};

function ProjectCard({ Icon, title, desc }: Props) {
  return (
    <div className="border border-neutral-800 rounded-lg py-8 px-10">
      <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
        <Icon className="w-8 h-8 text-black" />
      </div>
      <h3 className="text-2xl font-medium mt-5">{title}</h3>
      <p className="text-lg font-meidum text-neutral-400 mt-3">{desc}</p>
    </div>
  );
}

export default ProjectCard;
