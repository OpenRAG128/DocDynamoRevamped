import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './util/firebase'
import { clearUserChats } from './util/utils'
import { getChatList, getChatMessages } from './util/api'
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

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth state - initialized as null/false, Firebase will set actual values
  const [authLoading, setAuthLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(null)
  const [showLogin, setShowLogin] = useState({ show: false, message: '' })

  // If user has ever had an account 
  const [hasAccount, setHasAccount] = useState(() => {
    return localStorage.getItem('hasUserAccount') === 'true'
  })

  // Preloaded chats for sidebar
  const [preloadedChats, setPreloadedChats] = useState([])
  const [chatsLoading, setChatsLoading] = useState(false)

  // Helper to load and format chats
  const loadChats = async () => {
    setChatsLoading(true)
    try {
      const response = await getChatList()
      const chatList = Array.isArray(response) ? response : (response?.chats || response?.data || [])
      if (!Array.isArray(chatList)) {
        setPreloadedChats([])
        return
      }
      const formattedChats = chatList.map(chat => {
        // Handle timestamp conversion - support both seconds, milliseconds, and ISO strings
        let timestamp;
        if (chat.updated_at) {
          if (typeof chat.updated_at === 'number') {
            // If timestamp is less than 10 billion, it's likely in seconds; otherwise milliseconds
            timestamp = chat.updated_at < 10000000000
              ? new Date(chat.updated_at * 1000).toISOString()
              : new Date(chat.updated_at).toISOString();
          } else {
            // Handle ISO string or other date formats
            timestamp = new Date(chat.updated_at).toISOString();
          }
        } else {
          timestamp = new Date().toISOString();
        }

        return {
          id: chat._id,
          title: chat.title || 'Untitled Chat',
          timestamp,
          firstMessage: null, // Will be populated if title is "New Chat"
        };
      })
      formattedChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // For chats with "New Chat" title, fetch the first user message to use as display
      const chatsNeedingMessages = formattedChats.filter(chat => chat.title === 'New Chat')
      await Promise.all(chatsNeedingMessages.map(async (chat) => {
        try {
          const messagesResponse = await getChatMessages(chat.id, { page: 1, limit: 5 })
          if (messagesResponse?.messages?.length > 0) {
            // Find the first user message
            const firstUserMsg = messagesResponse.messages.find(m => m.role === 'user')
            if (firstUserMsg) {
              chat.firstMessage = firstUserMsg.content
            }
          }
        } catch (err) {
          console.error(`Error fetching messages for chat ${chat.id}:`, err)
        }
      }))

      setPreloadedChats(formattedChats)
    } catch (error) {
      console.error('Error preloading chats:', error)
      setPreloadedChats([])
    } finally {
      setChatsLoading(false)
    }
  }

  // Listen to Firebase auth state changes - this is the source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

      // Load chats for ALL users (authenticated, guest, or brand new session)
      // because unauthenticated users might still have a server-side session cookie 
      // containing their 1 free chat.
      await loadChats()

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
    setPreloadedChats([]) // Clear chats from state on logout
  }

  // Show login screen if not logged in and showLogin is true
  if (showLogin.show && !loggedIn) {
    return (
      <Login

        setLoggedIn={setLoggedIn}
        setShowLogin={setShowLogin}
        setUserId={setUserId}
        setHasAccount={setHasAccount}
        loginMessage={showLogin.message}
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

  // Shared layout elements
  // Handle chat deletion locally
  const handleChatDeleted = (chatId) => {
    setPreloadedChats(prev => prev.filter(c => c.id !== chatId));
  };

  const headerElement = (
    <Header
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(prev => !prev)}
      Collapsed={collapsed}
      toggleSidebar={() => setCollapsed(prev => !prev)}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      loggedIn={loggedIn}
      user={user}
      onLogin={() => setShowLogin({ show: true, message: '' })}
      onLogout={handleLogout}
      hasAccount={hasAccount}
    />
  );

  const sidebarElement = (
    <Sidebar
      onLogin={() => setShowLogin({ show: true, message: '' })}
      darkMode={darkMode}
      collapsed={collapsed}
      toggleSidebar={() => setCollapsed(prev => !prev)}
      main={main}
      userId={userId}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      hasAccount={hasAccount}
      loggedIn={loggedIn}
      initialChats={preloadedChats}
      chatsLoading={chatsLoading}
      onChatDeleted={handleChatDeleted}
    />
  );

  return (
    <Router>
      <Routes>
        <Route path="/mobileapp" element={<MobileApp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <div className="flex flex-col h-screen bg-background text-text">
              {headerElement}
              <div className="flex flex-1 overflow-hidden">
                {sidebarElement}
                <main className="flex-1 overflow-y-auto">
                  <MainSection
                    darkMode={darkMode}
                    setMain={setMain}
                    hasAccount={hasAccount}
                    loggedIn={loggedIn}
                    userId={userId}
                    preloadedChats={preloadedChats}
                    onRequireLogin={(msg) => setShowLogin({ show: true, message: msg || '' })}
                  />
                </main>
              </div>
            </div>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <div className="flex flex-col h-screen bg-background text-text">
              {headerElement}
              <div className="flex flex-1 overflow-hidden">
                {sidebarElement}
                <main className="flex-1 overflow-y-auto">
                  <ChatPage darkMode={darkMode} setMain={setMain} />
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  )
}
