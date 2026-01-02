import React from 'react'
import Sidebar from './components/Sidebar'
import MainSection from './components/MainSection'

export default function App() {
  return (
    <div className='flex'>
      <Sidebar />
      <MainSection />
    </div>
  )
}
