import React from 'react'

interface HeadingProps {
  text: string
}

const Heading: React.FC<HeadingProps> = ({ text }) => {
  return (
    <h1 className="overflow-hidden text-5xl font-medium tracking-tight sm:text-7xl">
      {text}
    </h1>
  )
}

export default Heading
