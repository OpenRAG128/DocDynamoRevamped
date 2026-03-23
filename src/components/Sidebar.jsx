import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatedList } from "./AnimatedList.jsx";
import { renameChat, deleteChat, resetSession } from "../util/api.js";
import {
  MessageCircle,
  Folder,
  Wrench,
  PlusIcon,
  EyeIcon,
  Lightbulb,
  CircleQuestionMarkIcon,
  Smartphone,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  RotateCcw
} from "lucide-react";

export default function Sidebar({ darkMode, collapsed, main, userId, mobileMenuOpen, setMobileMenuOpen, hasAccount, onLogin, loggedIn, initialChats = [], chatsLoading = false, onChatDeleted }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [cycle, setCycle] = useState(0);
  const [chats, setChats] = useState(initialChats);

  const [activeDropdown, setActiveDropdown] = useState(null); // { id, top, left } or null
  const [renamingChat, setRenamingChat] = useState(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    // Listen for scroll events to reposition or close dropdown
    function handleScroll() {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // true for capturing all scroll events
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeDropdown]);

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renamingChat || !newChatTitle.trim()) return;

    const newTitle = newChatTitle.trim();
    const targetChatId = renamingChat.id;

    // Optimsitic UI Update
    setChats(chats.map(c => c.id === targetChatId ? { ...c, title: newTitle } : c));
    setRenamingChat(null);

    try {
      await renameChat(targetChatId, newTitle);
    } catch (err) {
      console.error("Failed to rename chat", err);
      // Optional: Rollback logic would go here
    }
  };

  const handleDelete = async (chatId, e) => {
    e.stopPropagation();

    // Optimistic UI updates - execute immediately side-effects before network delay
    setChats(chats.filter(c => c.id !== chatId));

    // Update parent state (preloadedChats) so 1-chat limit is lifted
    if (onChatDeleted) {
      onChatDeleted(chatId);
    }

    // Also remove from guest storage if they are not logged in and it was stuck there
    try {
      if (!loggedIn) {
        const localKey = "docDynamoChats_guest";
        const localChatsStr = localStorage.getItem(localKey);
        if (localChatsStr) {
          const localChats = JSON.parse(localChatsStr);
          const filtered = localChats.filter(c => c.id !== chatId);
          localStorage.setItem(localKey, JSON.stringify(filtered));
        }
      }
    } catch (err) {
      console.error("Failed to update guest local storage:", err);
    }

    setActiveDropdown(null);
    if (location.pathname === `/chat/${chatId}`) {
      navigate('/');
    }

    try {
      await deleteChat(chatId);
    } catch (err) {
      console.error("Failed to delete chat", err);
      // Revert if API fails (optional, depending on preference)
      // If we wanted to revert: setChats(initialChats) or reload
    }
  };

  const handleReset = async (chatId, e) => {
    e.stopPropagation();

    // Immediate UI updates
    setActiveDropdown(null);
    if (location.pathname === `/chat/${chatId}`) {
      navigate('/');
    }

    try {
      await resetSession();
    } catch (err) {
      console.error("Failed to reset chat", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 9000); // re-animate every 3s

    return () => clearInterval(interval);
  }, []);

  // Sync with initialChats when they change (preloaded from App)
  useEffect(() => {
    // Always sync with initialChats, even if empty (handles logout/refresh scenarios)
    setChats(initialChats);
  }, [initialChats]);

  const glassBase =
    "relative overflow-hidden backdrop-blur-xl border shadow-lg after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/30 after:to-transparent after:opacity-30 after:pointer-events-none";

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
          {chatsLoading ? (
            <div className="mt-3 space-y-2 max-h-64 overflow-hidden px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-md animate-pulse ${darkMode ? "bg-gray-800/40" : "bg-gray-100/60"}`}
                >
                  <div className={`w-4 h-4 rounded shrink-0 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className={`h-3 rounded w-3/4 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`} />
                    <div className={`h-2 rounded w-1/2 ${darkMode ? "bg-gray-700/60" : "bg-gray-300/60"}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length !== 0 ? (
            <div className={`mt-3 space-y-1 max-h-64 overflow-y-auto scrollbar-custom ${darkMode ? 'dark-scrollbar' : 'light-scrollbar'}`}>
              {chats.map((chat) => (
                <div key={chat.id} className="relative group">
                  <button
                    onClick={() => handleNavigation(`/chat/${chat.id}`)}
                    className={`flex items-start gap-2 w-full px-4 py-2 rounded-md text-sm transition-colors text-left pr-8 ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <MessageCircle size={16} className="mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        {chat.title === 'New Chat' && chat.firstMessage
                          ? chat.firstMessage.slice(0, 50) + (chat.firstMessage.length > 50 ? '...' : '')
                          : chat.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeDropdown?.id === chat.id) {
                          setActiveDropdown(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setActiveDropdown({
                            id: chat.id,
                            top: rect.bottom,
                            left: rect.right - 160, // 160 is w-40
                            bottom: rect.bottom
                          });
                        }
                      }}
                      className={`p-1 rounded-md ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-600"}`}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
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

      </div>

      {/* Footer */}
      <div className={`p-4 space-y-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="mb-4 overflow-hidden">
          <AnimatedList key={cycle} delay={2000} className="space-y-2 mb-4">
            <div
              className={`${glassBase} w-full px-4 py-3 rounded-xl ${darkMode
                  ? "bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-white/20 text-gray-200 shadow-[0_0_15px] shadow-white/5"
                  : "bg-gradient-to-br from-gray-400/60 via-gray-300/40 to-gray-200/20 border-gray-400/40 text-gray-800 shadow-[0_0_15px] shadow-gray-400/40"
                }`}
            >
              Need more from your files?
            </div>
            <div
              className={`${glassBase} w-full px-4 py-3 rounded-xl font-medium ${darkMode
                  ? "bg-gradient-to-br from-purple-400/30 via-purple-300/15 to-purple-200/5 border-purple-300/30 text-purple-300 shadow-[0_0_15px] shadow-purple-400/10"
                  : "bg-gradient-to-br from-purple-300/60 via-purple-200/40 to-purple-100/20 border-purple-400/40 text-purple-800 shadow-[0_0_15px] shadow-purple-300/50"
                }`}
            >
              Try DocDynamo.
            </div>
            <div
              className={`${glassBase} w-full px-4 py-3 rounded-xl ${darkMode
                  ? "bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-white/20 text-gray-300 shadow-[0_0_15px] shadow-white/5"
                  : "bg-gradient-to-br from-gray-400/60 via-gray-300/40 to-gray-200/20 border-gray-400/40 text-gray-800 shadow-[0_0_15px] shadow-gray-400/40"
                }`}
            >
              Chat directly with them.
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
            className="block w-full text-center py-2 cursor-pointer rounded-full font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors "
          >
            {hasAccount ? 'Login' : 'Sign up'}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {renamingChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-sm rounded-xl p-6 shadow-2xl ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
            <h3 className="text-lg font-semibold mb-4">Rename chat</h3>
            <form onSubmit={handleRenameSubmit}>
              <input
                type="text"
                autoFocus
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md mb-6 outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"
                  }`}
                placeholder={renamingChat?.title === "New Chat" && renamingChat?.firstMessage ? renamingChat.firstMessage.slice(0, 50) + (renamingChat.firstMessage.length > 50 ? '...' : '') : (renamingChat?.title || "Chat title")}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRenamingChat(null)}
                  className={`px-4 py-2 font-medium rounded-md transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChatTitle.trim()}
                  className="px-4 py-2 font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Global Dropdown (Rendered outside overflow containers) */}
      {activeDropdown && (
        <div
          ref={dropdownRef}
          className={`fixed w-40 rounded-lg shadow-xl border overflow-hidden z-[110] ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          style={{
            top: activeDropdown.bottom + 120 > window.innerHeight ? activeDropdown.top - 140 : activeDropdown.top + 4,
            left: activeDropdown.left
          }}
        >
          {(() => {
            const chat = chats.find(c => c.id === activeDropdown.id);
            if (!chat) return null;
            return (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingChat(chat);
                    setNewChatTitle(chat.title === 'New Chat' && chat.firstMessage ? chat.firstMessage.slice(0, 50) + (chat.firstMessage.length > 50 ? '...' : '') : chat.title);
                    setActiveDropdown(null);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <Pencil size={14} /> Rename chat
                </button>
                <hr className={darkMode ? "border-gray-700" : "border-gray-200"} />
                <button
                  onClick={(e) => handleReset(chat.id, e)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <RotateCcw size={14} /> Reset chat
                </button>
                <button
                  onClick={(e) => handleDelete(chat.id, e)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors text-red-500 ${darkMode ? "hover:bg-gray-700" : "hover:bg-red-50"}`}
                >
                  <Trash2 size={14} /> Delete chat
                </button>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
}









