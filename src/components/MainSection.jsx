import React from 'react'
import Header from './Header.jsx'

export default function MainSection() {
  return (
    <div className='flex flex-col w-full'>
      <Header />
      <div className='flex justify-center items-center h-full w-full border-2'>
        Main Section
      </div>
    </div>
  )
}
