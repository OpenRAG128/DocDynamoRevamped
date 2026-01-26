import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from "react-router-dom"
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainSection from './components/MainSection'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <Router>
      <div className="flex flex-col h-screen bg-background text-text">
        <Header
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(prev => !prev)}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        />

        <div className="flex flex-1 overflow-hidden ">
          <Sidebar
            darkMode={darkMode}
            collapsed={sidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto">
            <MainSection
              darkMode={darkMode}
            />
          </main>
        </div>
      </div>
    </Router>
  )
}
