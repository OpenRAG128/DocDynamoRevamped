import { Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Header({ darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar }) {
  return (
    <div className={`pr-4 py-3 flex justify-between items-center w-full border-b transition-colors ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } gap-3`}>
      <div className="flex items-center gap-2 pl-4">
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
        <button className='px-4 py-1 rounded-full bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors font-family-sans font-medium'>
          Sign up
        </button>
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
