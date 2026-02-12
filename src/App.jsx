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
import MobileApp from './components/MobileApp'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  });
  const [main, setMain] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth state - initialized as null/false, Firebase will set actual values
  const [authLoading, setAuthLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  // If user has ever had an account 
  const [hasAccount, setHasAccount] = useState(() => {
    return localStorage.getItem('hasUserAccount') === 'true'
  })

  // Listen to Firebase auth state changes - this is the source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated via Firebase
        setUser(firebaseUser)
        setUserId(firebaseUser.uid)
        setLoggedIn(true)
        localStorage.setItem('loginState', JSON.stringify({
          loggedIn: true,
          timestamp: Date.now(),
          userId: firebaseUser.uid
        }))
      } else {
        // No Firebase user - check for guest session in localStorage
        const saved = localStorage.getItem('loginState')
        if (saved) {
          try {
            const { loggedIn: wasLoggedIn, timestamp, userId: savedUserId } = JSON.parse(saved)
            const sevenDays = 7 * 24 * 60 * 60 * 1000
            // Only restore guest sessions (Firebase users must re-authenticate)
            if (wasLoggedIn && savedUserId?.startsWith('guest_') && Date.now() - timestamp < sevenDays) {
              setUserId(savedUserId)
              setLoggedIn(true)
            } else if (!savedUserId?.startsWith('guest_')) {
              // Firebase user session expired, clear localStorage
              localStorage.removeItem('loginState')
              setUser(null)
              setUserId(null)
              setLoggedIn(false)
            }
          } catch (error) {
            console.error('Error parsing loginState:', error)
            localStorage.removeItem('loginState')
          }
        }
      }
      setAuthLoading(false)
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

  // Show loading state while Firebase checks auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Layout wrapper for main app pages
  const AppLayout = ({ children }) => (
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
          onLogin={() => setShowLogin(true)}
          darkMode={darkMode}
          collapsed={sidebarCollapsed}
          main={main}
          userId={userId}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          hasAccount={hasAccount}
          loggedIn={loggedIn}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/mobileapp" element={<MobileApp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AppLayout>
              <MainSection darkMode={darkMode} setMain={setMain} userId={userId} />
            </AppLayout>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <AppLayout>
              <ChatPage darkMode={darkMode} setMain={setMain} userId={userId} />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  )
}
