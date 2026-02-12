import { useState, useRef, useEffect } from 'react';
import { Upload, MessageSquare, FileText, File, FileType, FileType2, SendHorizontalIcon } from 'lucide-react';
import Card from './Card.jsx';
import FeaturesSection from './FeaturesSection.jsx';
import { saveChatWithCloudSync } from '../util/utils.js';
import {
  FaGraduationCap,
  FaFlask,
  FaBriefcase,
  FaChalkboardTeacher,
  FaTasks,
  FaRocket,
  FaUserAlt,
  FaGavel,
  FaCoins,
} from "react-icons/fa";
import Footer from './Footer.jsx';

export default function MainSection({ darkMode, setMain, userId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState("Student");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMain(false);
  }, []);

  const saveChat = async (chatId, chatData) => {
    try {
      // Use the new cloud sync function which handles both local and cloud storage
      await saveChatWithCloudSync(chatId, chatData, chatData.files, userId);
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };
  const roles = [
    { label: "Student", icon: <FaGraduationCap /> },
    { label: "Researcher", icon: <FaFlask /> },
    { label: "Professional", icon: <FaBriefcase /> },
    { label: "Teacher", icon: <FaChalkboardTeacher /> },
    { label: "Product Manager", icon: <FaTasks /> },
    { label: "Founder", icon: <FaRocket /> },
    { label: "Developer", icon: <FaUserAlt /> },
    { label: "Policy Maker", icon: <FaGavel /> },
    { label: "Investor", icon: <FaCoins /> },
  ];

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    const incomingFiles = Array.from(files);

    if (incomingFiles.length > 5) {
      setError('You can upload up to 5 files at a time.');
      setSelectedFiles([]);
      return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const hasInvalid = incomingFiles.some((file) => {
      const extension = file.name.split('.').pop().toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (hasInvalid) {
      setError('Some files are unsupported. Please upload only PDF, DOC/DOCX, or TXT files.');
      setSelectedFiles([]);
      return;
    }

    setError('');
    setSelectedFiles(incomingFiles);

    // Placeholder: wire this into your processing/upload pipeline
    // e.g. send to backend or client-side parser
    console.log('Selected files:', incomingFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const { files } = e.dataTransfer || {};
    handleFiles(files);
  };

  const handleFileChange = (e) => {
    const { files } = e.target || {};
    handleFiles(files);
  };

  // Close dropdown when clicking outside
  useState(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='flex flex-col w-full min-h-full'>
      <div className='flex justify-center items-center flex-1 w-full bg-background px-3 sm:px-6 lg:px-8 py-4'>
        <div className='flex flex-col justify-center items-center gap-4 sm:gap-6 max-w-7xl w-full'>
          {/* Hero Section Header*/}
          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 font-family-sans mt-2'>
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
            className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 w-full max-w-4xl relative ${darkMode ? "bg-white/5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "bg-white/30 border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"}`}
            style={{
              boxShadow: darkMode
                ? '0 0 30px rgba(103, 80, 246, 0.4), 0 0 60px rgba(103, 80, 246, 0.3), 0 0 90px rgba(103, 80, 246, 0.2), 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                : '0 0 30px rgba(50, 88, 213, 0.25), 0 0 60px rgba(50, 88, 213, 0.15), 0 0 90px rgba(50, 88, 213, 0.1), 0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
            }}
          >
            {/* Header */}
            <div className='pb-4 sm:pb-6 flex flex-col justify-center items-center gap-2'>
              <h2 className='text-text text-center font-family-display text-xl sm:text-2xl font-bold px-4'>Chat with any type of file</h2>
              <div className='flex flex-wrap justify-center font-family-display items-center gap-2 text-xs sm:text-sm text-text/60'>
                <span className='flex items-center gap-1'><FileType size={14} className="text-blue-500" /> DOCX</span>
                <span>•</span>
                <span className='flex items-center gap-1'><FileText size={14} className="text-red-500" /> PDF</span>
                <span>•</span>
                <span className='flex items-center gap-1'><File size={14} className="text-blue-600" /> Word</span>
                <span>•</span>
                <span className='flex items-center gap-1'><FileType2 size={14} className="text-gray-500" /> TXT</span>
              </div>
            </div>

            {/* Action cards */}
            <div className='font-family-display flex flex-col md:flex-row justify-center items-stretch gap-4 sm:gap-6 w-full'>
              {/* Upload Card */}
              <div
                className={`group relative flex flex-col justify-center items-center min-h-56 sm:min-h-64 w-full md:w-1/2 rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer overflow-hidden
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                {/* Gradient overlay on hover */}
                <div className='absolute inset-0 bg-gradient-to-br from-[#3258d5]/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                {selectedFiles.length === 0 ?
                  <div className='relative z-10 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6'>
                    <div className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-700 group-hover:bg-accent/20' : 'bg-gray-200 group-hover:bg-accent/10'}`}>
                      <Upload size={28} className={`sm:w-8 sm:h-8 transition-all duration-300 ${isDragging ? 'text-accent animate-bounce' : 'text-gray-500 group-hover:text-accent'}`} />
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                      <p className='text-text font-semibold text-base sm:text-lg'>Drop files here</p>
                      <p className='text-text/60 text-xs sm:text-sm text-center'>or</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className='px-5 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-sm sm:text-base font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer'
                      >
                        Browse Files
                      </button>
                    </div>
                    <p className='text-text/40 text-xs text-center mt-1 sm:mt-2'>Supports up to 5 PDF, DOCX, or TXT files
                    </p>
                  </div>
                  : <div className='relative z-10 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6'>
                    <div className='flex flex-col items-center'>
                      <p className='font-bold'>
                        {
                          selectedFiles.length === 1 ? "Selected Document" : "Selected Documents :"
                        }
                      </p>
                      {selectedFiles &&
                        selectedFiles.map((file) => {
                          return <p className="text-text/60 text-sm text-center mt-1 sm:mt-2 px-2 truncate w-full max-w-xs" title={file.name}>
                            {file.name}
                          </p>
                        })
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles([]);
                      }}
                      className='px-5 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-sm sm:text-base font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer'
                    >
                      Reset
                    </button>
                  </div>
                }
              </div>

              {/* Start Chat Card */}
              <div
                className={`group relative flex flex-col min-h-56 sm:min-h-64 w-full md:w-1/2 rounded-lg sm:rounded-2xl transition-all duration-300
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
                    <MessageSquare size={16} className="sm:w-4.5 sm:h-4.5 text-accent" />
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
                      className="flex-1 min-h-16 resize-none bg-transparent outline-none text-sm text-text placeholder:text-text/40" value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)} />

                    {/* Custom Role Dropdown */}
                    <div className="flex items-center gap-2 mt-2">
                      <div ref={dropdownRef} className="relative flex-1 max-w-[180px]">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${darkMode
                            ? 'bg-gray-700 border border-gray-600/70 text-text hover:border-gray-500'
                            : 'bg-white border border-gray-300 text-text hover:border-gray-400'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            {roles.find(r => r.label === selectedRole)?.icon}
                            <span className="truncate">{selectedRole}</span>
                          </span>
                          <svg
                            className={`w-4 h-4 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isDropdownOpen && (
                          <div className={`absolute bottom-full mb-1 z-50 w-full rounded-lg shadow-lg max-h-48 overflow-y-auto ${darkMode
                            ? 'bg-gray-700 border border-gray-600'
                            : 'bg-white border border-gray-300'
                            }`}>
                            {roles.map((role) => (
                              <button
                                key={role.label}
                                type="button"
                                onClick={() => {
                                  setSelectedRole(role.label);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full cursor-pointer px-3 py-2 text-sm flex items-center gap-2 transition-colors ${selectedRole === role.label
                                  ? darkMode
                                    ? 'bg-accent/90 text-accent'
                                    : 'bg-accent/10 text-accent'
                                  : darkMode
                                    ? 'text-text hover:bg-gray-600'
                                    : 'text-text hover:bg-gray-100'
                                  }`}
                              >
                                {role.icon}
                                {role.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Send Button */}
                      <button
                        disabled={isUploading}
                        onClick={async () => {
                          // Validation checks
                          if (selectedFiles.length === 0) {
                            setError('Please upload at least one file before starting a chat.');
                            return;
                          }

                          if (!chatMessage.trim()) {
                            setError('Please enter a message before starting a chat.');
                            return;
                          }

                          // Clear any previous errors
                          setError('');
                          setIsUploading(true);

                          try {
                            const uniqueId = crypto.randomUUID();
                            await saveChat(uniqueId, {
                              message: chatMessage,
                              role: selectedRole,
                              files: selectedFiles
                            });
                            window.location.href = `/chat/${uniqueId}`;
                          } catch (err) {
                            console.error('Error creating chat:', err);
                            setError('Failed to create chat. Please try again.');
                            setIsUploading(false);
                          }
                        }}
                        className={`p-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent hover:shadow-lg cursor-pointer shrink-0 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {isUploading ? (
                          <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <SendHorizontalIcon size={18} className="text-white" />
                        )}
                      </button>
                    </div>

                    {/* Footer - Error message */}
                    {error && (
                      <p className='text-red-500 text-xs mt-2'>
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Card
            quote="It's like ChatGPT, but for"
            highlightText=" research papers."
            authorName="Rick Grimes, PhD"
            authorHandle="@SolictingSherrif"
            authorImage="/avatar.jpg"
            darkMode={darkMode}
          />
          <FeaturesSection darkMode={darkMode} />
          <Footer />
        </div>
      </div>
    </div>
  )
}  
