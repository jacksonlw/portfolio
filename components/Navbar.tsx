import { ArrowRightIcon } from '@heroicons/react/outline'
import Link from 'next/link'

function Navbar() {
  return (
    <div className="fixed z-10 flex h-24 w-full items-center justify-center bg-[rgba(255,255,255,0.5)] backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-8 2xl:px-16">
        <p className="hidden text-xl font-medium sm:block">Jackson Lawrence</p>
        <Link
          className="flex cursor-pointer items-center justify-center hover:underline"
          href="mailto:jlawrence1787@gmail.com"
        >
          <p className="mr-1 text-lg font-medium">jlawrence1787@gmail.com</p>
          <ArrowRightIcon className="mt-[-1px] h-6 w-6 -rotate-45" />
        </Link>
      </div>
    </div>
  )
}

export default Navbar
