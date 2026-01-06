import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from "react-router-dom"
import Sidebar from './components/Sidebar'
import MainSection from './components/MainSection'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <Router>
      <div className="flex h-screen bg-background text-text">
        <Sidebar
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(prev => !prev)}
        />
        <MainSection
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(prev => !prev)}
        />
      </div>
    </Router>
  )
}
