import { Sun, Moon } from 'lucide-react';

export default function Header({ darkMode, toggleDarkMode }) {
  return (
    <div className={`pr-4 py-3 flex justify-end items-center w-full border-b transition-colors ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } gap-3`}>
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
  )
}
