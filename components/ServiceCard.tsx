import React from "react";

type Props = {
  Icon: React.FC<React.ComponentProps<"svg">>;
  title: string;
  desc: string;
};

function ProjectCard({ Icon, title, desc }: Props) {
  return (
    <div className="px-10 py-8 border rounded-lg border-neutral-800">
      <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg">
        <Icon className="w-8 h-8 text-black" />
      </div>
      <h3 className="mt-5 text-xl font-medium sm:text-2xl">{title}</h3>
      <p className="mt-3 text-base sm:text-lg font-meidum text-neutral-400">
        {desc}
      </p>
    </div>
  );
}

export default ProjectCard;
