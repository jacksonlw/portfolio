import { ArrowRightIcon } from "@heroicons/react/outline";
import React from "react";

function Navbar() {
  return (
    <div className="w-screen h-24 bg-[rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-center fixed">
      <div className="w-full px-16 flex justify-between items-center">
        <p className="text-xl font-medium">Jackson</p>
        <button className="flex items-center justify-center">
          <p className="text-lg font-medium mr-1">jlawrence1787@gmail.com</p>
          <ArrowRightIcon className="w-6 h-6 mt-[-1px] -rotate-45" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
