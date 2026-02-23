import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatedList } from "./AnimatedList.jsx";
import {
  MessageCircle,
  Folder,
  Wrench,
  PlusIcon,
  EyeIcon,
  Lightbulb,
  CircleQuestionMarkIcon,
  Smartphone,
  MoreVertical,
  Edit3,
  Share2,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

export default function Sidebar({ darkMode, collapsed, main, userId, mobileMenuOpen, setMobileMenuOpen, hasAccount, onLogin, loggedIn, initialChats = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [cycle, setCycle] = useState(0);
  const [chats, setChats] = useState(initialChats);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 9000); // re-animate every 3s

    return () => clearInterval(interval);
  }, []);

  // Sync with initialChats when they change (preloaded from App)
  useEffect(() => {
    if (initialChats.length > 0) {
      setChats(initialChats);
    }
  }, [initialChats]);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenameChat = async (chatId) => {
    const newTitle = prompt('Enter new chat name:');
    if (newTitle && newTitle.trim()) {
      // Update local state (backend manages the actual data)
      const updatedChats = chats.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle.trim() } : chat
      );
      setChats(updatedChats);
      // Note: Backend rename endpoint would be called here if available
    }
    setOpenMenuId(null);
  };

  const glassBase =
    "relative overflow-hidden backdrop-blur-xl border shadow-lg after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/30 after:to-transparent after:opacity-30 after:pointer-events-none";


  const handleShareChat = (chatId) => {
    alert('Share functionality coming soon!');
    setOpenMenuId(null);
  };

  const handleResetChat = (chatId) => {
    if (confirm('Are you sure you want to reset this chat?')) {
      // Reset chat logic here
      alert('Chat reset!');
    }
    setOpenMenuId(null);
  };

  const handleDeleteChat = async (chatId) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      // Remove from local state (backend manages the actual data)
      const updatedChats = chats.filter(chat => chat.id !== chatId);

      // Check if we're currently viewing the deleted chat or if no chats remain
      const isViewingDeletedChat = location.pathname === `/chat/${chatId}`;
      if (isViewingDeletedChat || updatedChats.length === 0) {
        navigate('/');
      }
      setChats(updatedChats);
      // Note: Backend delete endpoint would be called here if available
    }
    setOpenMenuId(null);
  };

  // Helper function to navigate and close mobile menu
  const handleNavigation = (path) => {
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    window.location.href = path;
  };

  // Mobile sidebar content (shared between mobile and desktop views)
  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className={`flex-1 overflow-y-auto scrollbar-custom ${darkMode ? 'dark-scrollbar' : 'light-scrollbar'}`}>
        {/* Mobile header with close button */}
        {isMobile && (
          <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Chats */}
        <div className="px-4 mt-4">
          <p className={`text-base mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Chats
          </p>
          {main && (
            <button
              className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer rounded-md text-sm transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
                }`}
              onClick={() => handleNavigation('/')}
            >
              <PlusIcon size={18} />
              Start new chat
            </button>
          )}

          {/* Chat History */}
          {chats.length !== 0 ? (
            <div className={`mt-3 space-y-1 max-h-64 overflow-y-auto scrollbar-custom ${darkMode ? 'dark-scrollbar' : 'light-scrollbar'}`}>
              {chats.map((chat) => (
                <div key={chat.id} className="relative group">
                  <button
                    onClick={() => handleNavigation(`/chat/${chat.id}`)}
                    className={`flex items-start gap-2 w-full px-4 py-2 rounded-md text-sm transition-colors text-left ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <MessageCircle size={16} className="mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate w-11/12">
                        {chat.title === 'New Chat' && chat.firstMessage
                          ? chat.firstMessage.slice(0, 50) + (chat.firstMessage.length > 50 ? '...' : '')
                          : chat.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </button>

                  {/* Menu Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuPosition({
                        top: rect.top + 20,
                        left: rect.right - 7
                      });
                      setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-600"
                      }`}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Context Menu */}
                  {openMenuId === chat.id && (
                    <div
                      ref={menuRef}
                      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                      className={`fixed w-48 rounded-lg shadow-lg border z-[60] py-1 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                        }`}
                    >
                      <button
                        onClick={() => handleRenameChat(chat.id)}
                        className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer text-sm text-left transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <Edit3 size={16} />
                        Rename chat
                      </button>
                      <button
                        onClick={() => handleShareChat(chat.id)}
                        className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer text-sm text-left transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <Share2 size={16} />
                        Share chat
                      </button>
                      <button
                        onClick={() => handleResetChat(chat.id)}
                        className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer text-sm text-left transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <RotateCcw size={16} />
                        Reset chat
                      </button>
                      <button
                        onClick={() => handleDeleteChat(chat.id)}
                        className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer text-sm text-left transition-colors ${darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"
                          }`}
                      >
                        <Trash2 size={16} />
                        Delete chat
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 space-y-1 max-h-64">
              <p className={`text-sm mt-0.5 text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                No Previous Chats
              </p>
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="px-4 mt-6">
          <p className={`text-base mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tools</p>
          <button className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer rounded-md text-sm transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <CircleQuestionMarkIcon size={18} />
            Questions
          </button>
          <button className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer rounded-md text-sm transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <Lightbulb size={18} />
            Concepts
          </button>
          <button className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer rounded-md text-sm transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <EyeIcon size={18} />
            Add-on info
          </button>
          <button
            onClick={() => handleNavigation('/mobileapp')}
            className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer rounded-md text-sm transition-colors ${darkMode
              ? "text-gray-300 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Smartphone size={18} />
            Mobile App
          </button>

        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 space-y-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="mb-4 overflow-hidden">
          <AnimatedList key={cycle} delay={2000} className="space-y-2">
            <div
              className={`${glassBase} w-full px-4 py-3 rounded-xl ${darkMode
                ? "bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-white/20 text-gray-200"
                : "bg-gradient-to-br from-gray-400/60 via-gray-300/40 to-gray-200/20 border-gray-400/40 text-gray-800 shadow-sm"
                }`}
            >
              Know what's better than Static Documents?
            </div>
            <div
              className={`${glassBase} w-full px-4 py-3 rounded-xl font-medium ${darkMode
                ? "bg-gradient-to-br from-purple-400/30 via-purple-300/15 to-purple-200/5 border-purple-300/30 text-purple-300"
                : "bg-gradient-to-br from-purple-300/60 via-purple-200/40 to-purple-100/20 border-purple-400/40 text-purple-800"
                }`}
            >
              DocDynamo
            </div>
            <div
              className={`${glassBase} w-full px-4 py-3 rounded-xl ${darkMode
                ? "bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-white/20 text-gray-300"
                : "bg-gradient-to-br from-gray-400/60 via-gray-300/40 to-gray-200/20 border-gray-400/40 text-gray-800 shadow-sm"
                }`}
            >
              Coz it makes them talk
            </div>
          </AnimatedList>
        </div>
        {!loggedIn && (
          <button
            type="button"
            onClick={() => {
              if (setMobileMenuOpen) {
                setMobileMenuOpen(false); // closes sidebar on mobile
              }
              onLogin();
            }}
            className="block w-full text-center py-2 cursor-pointer rounded-full font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            {hasAccount ? 'Login' : 'Sign up'}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-full border-r font-family-sans drop-shadow-xs flex-col justify-between transition-all duration-200
        ${collapsed ? "w-16" : "w-64"}
        ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
      >
        {collapsed ? (
          /* Collapsed View */
          <div className="flex flex-col items-center gap-6 mt-10">
            <button
              className={`transition-colors ${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"}`}
              aria-label="Chats"
            >
              <MessageCircle size={20} />
            </button>
            <button
              className={`transition-colors ${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"}`}
              aria-label="Folders"
            >
              <Folder size={20} />
            </button>
            <button
              className={`transition-colors ${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-600 hover:text-purple-600"}`}
              aria-label="Tools"
            >
              <Wrench size={20} />
            </button>
          </div>
        ) : (
          <SidebarContent />
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <aside
            className={`md:hidden fixed top-0 left-0 h-full w-72 z-50 flex flex-col font-family-sans shadow-xl transition-transform duration-300 ${darkMode ? "bg-gray-900" : "bg-white"
              }`}
          >
            <SidebarContent isMobile={true} />
          </aside>
        </>
      )}
    </>
  );
}
