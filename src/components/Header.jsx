import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, PanelLeftClose, PanelLeftOpen, LogOut, User, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.svg';

export default function Header({ darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar, loggedIn, user, onLogin, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Guest';
  };

  const getUserInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'G';
  };

  return (
    <div className={`pr-4 py-3 flex justify-between items-center w-full border-b transition-colors ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } gap-3 drop-shadow-sm relative z-50`}>
      <div className="flex items-center gap-2 pl-4">
        <img src={logo} alt="DocDynamo Logo" className='h-7 w-7' />
        <span
          className={`text-2xl font-family-sans font-extrabold ${darkMode ? "text-purple-400" : "text-purple-600"
            }`}
        >
          DocDynamo
        </span>
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded transition-colors ${darkMode
            ? "hover:bg-gray-800 text-gray-300"
            : "hover:bg-gray-100 text-gray-700"
            }`}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {loggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-full transition-colors ${darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
                }`}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${darkMode
                  ? "bg-purple-600 text-white"
                  : "bg-purple-500 text-white"
                  }`}>
                  {getUserInitial()}
                </div>
              )}
              <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {showDropdown && (
              <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border z-100 ${darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
                }`}>
                <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0 ${darkMode
                        ? "bg-purple-600 text-white"
                        : "bg-purple-500 text-white"
                        }`}>
                        {getUserInitial()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className={`font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {getUserDisplayName()}
                      </p>
                      {user?.email && (
                        <p className={`text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {user.email}
                        </p>
                      )}
                      {!user && (
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Guest account
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLogin}
            className='px-4 py-1 rounded-full bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors font-family-sans font-medium'
          >
            Sign up
          </button>
        )}
        <button
          className={`cursor-pointer p-1.5 rounded-md transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
            }`}
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} color='#fbbf24' /> : <Moon size={20} color='#4b5563' />}
        </button>
      </div>
    </div>
  )
}
