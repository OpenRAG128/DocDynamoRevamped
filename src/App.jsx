import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './util/firebase'
import { clearUserChats } from './util/utils'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainSection from './components/MainSection'
import ChatPage from './components/ChatPage'
import Login from './components/Login'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  });
  const [main, setMain] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth state
  const [loggedIn, setLoggedIn] = useState(() => {
    const saved = localStorage.getItem('loginState')
    if (saved) {
      const { loggedIn, timestamp } = JSON.parse(saved)
      // Check if login is still valid (e.g., within 7 days)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - timestamp < sevenDays) {
        return loggedIn
      }
    }
    return false
  })
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(() => {
    const saved = localStorage.getItem('loginState')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.userId || null
    }
    return null
  })
  const [showLogin, setShowLogin] = useState(false)

  // If user has ever had an account 
  const [hasAccount, setHasAccount] = useState(() => {
    return localStorage.getItem('hasUserAccount') === 'true'
  })

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setUserId(firebaseUser.uid)
        setLoggedIn(true)
        localStorage.setItem('loginState', JSON.stringify({
          loggedIn: true,
          timestamp: Date.now(),
          userId: firebaseUser.uid
        }))
      } else {
        setUser(null)
        // Don't automatically log out - allow guest mode
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }

    // Clear user's chats on logout (for guest users)
    // Firebase users keep their chats tied to their uid
    const savedState = localStorage.getItem('loginState')
    if (savedState) {
      const { userId: savedUserId } = JSON.parse(savedState)
      if (savedUserId && savedUserId.startsWith('guest_')) {
        await clearUserChats(savedUserId)
      }
    }

    localStorage.removeItem('loginState')
    setUser(null)
    setUserId(null)
    setLoggedIn(false)
  }

  // Show login screen if not logged in and showLogin is true
  if (showLogin && !loggedIn) {
    return (
      <Login
        setLoggedIn={setLoggedIn}
        setShowLogin={setShowLogin}
        setUserId={setUserId}
        setHasAccount={setHasAccount}
      />
    )
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-background text-text">
        <Header
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(prev => !prev)}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={() => setSidebarCollapsed(prev => !prev)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          loggedIn={loggedIn}
          user={user}
          onLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          hasAccount={hasAccount}
        />

        <div className="flex flex-1 overflow-hidden ">
          <Sidebar
            darkMode={darkMode}
            collapsed={sidebarCollapsed}
            main={main}
            userId={userId}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route
                path="/"
                element={<MainSection darkMode={darkMode} setMain={setMain} userId={userId} />}
              />
              <Route
                path="/chat/:chatId"
                element={<ChatPage darkMode={darkMode} setMain={setMain} userId={userId} />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}
