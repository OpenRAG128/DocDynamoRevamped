import { useState } from 'react';
import Header from './Header.jsx';
import { Upload, MessageSquare, FileText, Link } from 'lucide-react';
import Card from './Card.jsx';

export default function MainSection({ darkMode, toggleDarkMode }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload logic here
  };

  return (
    <div className='flex flex-col w-full min-h-screen gap-5'>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className='flex justify-center items-center flex-1 w-full bg-background px-4 sm:px-6 lg:px-8 pb-10'>
        <div className='flex flex-col justify-center items-center gap-2 sm:gap-8 max-w-7xl w-full'>
          {/* Hero Section Header*/}
          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 sm:mb-5 font-family-sans mt-2'>
            <img
              src="/hero.png"
              alt="Contextual Intelligence"
              className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 drop-shadow-2xl'
            />
            <div className='flex flex-col justify-center items-center sm:items-start sm:gap-2'>
              <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#3258d5] to-accent font-extrabold text-center sm:text-left leading-tight'>
                Contextual Intelligence
              </span>
              <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-text font-extrabold font-display text-center sm:text-left leading-tight'>
                built on trust.
              </span>
            </div>
          </div>
          {/* Main interaction container */}
          <div
            className={`p-2 sm:p-6 lg:p-8 flex flex-col justify-center items-center rounded-xl sm:rounded-2xl backdrop-blur-sm transition-all duration-300 w-206.25 relative ${darkMode ? "bg-gray-900/40 border border-gray-700/50" : "bg-white/60 border border-gray-200/50"}`}
            style={{
              boxShadow: darkMode
                ? '0 0 30px rgba(103, 80, 246, 0.4), 0 0 60px rgba(103, 80, 246, 0.3), 0 0 90px rgba(103, 80, 246, 0.2), 0 10px 40px rgba(0, 0, 0, 0.5)'
                : '0 0 30px rgba(50, 88, 213, 0.25), 0 0 60px rgba(50, 88, 213, 0.15), 0 0 90px rgba(50, 88, 213, 0.1), 0 10px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Header */}
            <div className='pb-4 sm:pb-6 flex flex-col justify-center items-center gap-2'>
              <h2 className='text-text text-center font-family-display text-xl sm:text-2xl font-bold px-4'>Chat with any type of file</h2>
              <div className='flex flex-wrap justify-center font-family-display items-center gap-2 text-xs sm:text-sm text-text/60'>
                <span className='flex items-center gap-1'><FileText size={14} /> PDF</span>
                <span>•</span>
                <span className='flex items-center gap-1'><FileText size={14} /> DOCX</span>
                <span>•</span>
                <span className='flex items-center gap-1'><FileText size={14} /> Word</span>
                <span>•</span>
                <span className='flex items-center gap-1'><Link size={14} /> URL</span>
              </div>
            </div>

            {/* Action cards */}
            <div className='font-family-display flex flex-col md:flex-row justify-center items-stretch gap-4 sm:gap-6 w-full'>
              {/* Upload Card */}
              <div
                className={`group relative flex flex-col justify-center items-center min-h-60 sm:h-64 w-full md:w-1/2 lg:w-80 rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer overflow-hidden
                  ${isDragging
                    ? 'border-2 border-dashed border-accent bg-accent/10 scale-105'
                    : darkMode
                      ? 'border-2 border-dashed border-gray-600 bg-gray-800/50 hover:border-accent hover:bg-gray-800'
                      : 'border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-accent hover:bg-white hover:shadow-lg'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Gradient overlay on hover */}
                <div className='absolute inset-0 bg-gradient-to-br from-[#3258d5]/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                <div className='relative z-10 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6'>
                  <div className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-700 group-hover:bg-accent/20' : 'bg-gray-200 group-hover:bg-accent/10'}`}>
                    <Upload size={28} className={`sm:w-8 sm:h-8 transition-all duration-300 ${isDragging ? 'text-accent animate-bounce' : 'text-gray-500 group-hover:text-accent'}`} />
                  </div>
                  <div className='flex flex-col items-center gap-2'>
                    <p className='text-text font-semibold text-base sm:text-lg'>Drop a file here</p>
                    <p className='text-text/60 text-xs sm:text-sm text-center'>or</p>
                    <button className='px-5 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-sm sm:text-base font-medium hover:shadow-lg hover:scale-105 transition-all duration-300'>
                      Browse Files
                    </button>
                  </div>
                  <p className='text-text/40 text-xs text-center mt-1 sm:mt-2 px-2'>Supports PDF, DOCX, TXT, and more</p>
                </div>
              </div>

              {/* Start Chat Card */}
              <div
                className={`group relative flex flex-col min-h-[240px] sm:h-64 w-full md:w-1/2 lg:w-87.5 rounded-lg sm:rounded-2xl transition-all duration-300 overflow-hidden
    ${darkMode
                    ? 'bg-gray-900/60 border border-gray-700 hover:border-accent/50'
                    : 'bg-white border border-gray-200 hover:border-accent/50'
                  }`}
              >
                {/* Gradient hover layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-[#3258d5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 flex flex-col h-full p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px] text-accent" />
                    <h3 className="font-display text-base sm:text-lg font-semibold text-text">
                      Start a chat
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-text/60 mb-3 sm:mb-4">
                    Ask questions, summarize content, or extract insights.
                  </p>

                  {/* Chat Input */}
                  <div
                    className={`flex flex-col flex-1 rounded-xl p-3 transition-all
        ${darkMode
                        ? 'bg-gray-800 border border-gray-700 focus-within:border-accent'
                        : 'bg-gray-50 border border-gray-200 focus-within:border-accent'
                      }`}
                  >
                    <textarea
                      placeholder="Ask something like “Summarize this document” or “Explain key points”"
                      className="flex-1 resize-none bg-transparent outline-none text-sm text-text placeholder:text-text/40"
                    />

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3">
                      {/* Shortcut hint */}
                      <span className="text-xs text-text/50">
                        CTRL + V to paste text or links
                      </span>

                      {/* Send Button */}
                      <button className="p-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent hover:shadow-lg transition-all hover:scale-105">
                        <MessageSquare size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Card
            quote="It's like ChatGPT, but for"
            highlightText=" research papers."
            authorName="Mushtaq Bilal, PhD"
            authorHandle="@MushtaqBilalPhD"
            authorImage="/avatar.jpg"
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  )
}  
