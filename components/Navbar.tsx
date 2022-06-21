import { ArrowRightIcon } from "@heroicons/react/outline";
import React from "react";
import ShowOnScroll from "./ShowOnScroll";

function Navbar() {
  return (
    <ShowOnScroll className="w-full h-24 bg-[rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-center fixed z-10">
      <div className="flex items-center justify-between w-full px-8 2xl:px-16">
        <p className="hidden text-xl font-medium sm:block">Jackson</p>
        <a
          className="flex items-center justify-center cursor-pointer"
          href="mailto:jlawrence1787@gmail.com"
        >
          <p className="mr-1 text-lg font-medium">jlawrence1787@gmail.com</p>
          <ArrowRightIcon className="w-6 h-6 mt-[-1px] -rotate-45" />
        </a>
      </div>
    </ShowOnScroll>
  );
}

export default Navbar;
