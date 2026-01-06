import React from 'react'
import Header from './Header.jsx'

export default function MainSection({ darkMode, toggleDarkMode }) {
  return (
    <div className='flex flex-col w-full'>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className='flex justify-center items-center h-full w-full bg-background'>
        Main Section
      </div>
    </div>
  )
}  
