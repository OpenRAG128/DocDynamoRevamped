import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, MessageSquare, FileText, File, FileType, FileType2, SendHorizontalIcon, X, CheckCircle2 } from 'lucide-react';
import FeaturesSection from './FeaturesSection.jsx';
import PromptSuggestions from './PromptSuggestions.jsx';
import { saveFilesToIndexedDB, getUserChats, saveChatWithCloudSync } from '../util/utils.js';
import { queryDocument } from '../util/api.js';
import { personas } from '../util/personas.jsx';
import Footer from './Footer.jsx';

const placeholderSuggestions = [
  'What are the key variance drivers vs last quarter?',
  'Summarise PMLA obligations for NBFCs',
  'What changed in latest RBI circular?',
  'What are all events of default in this agreement?',
  'List all contingent liabilities disclosed',
];

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return <FileText size={14} className="text-red-500" />;
    case 'doc': case 'docx': return <File size={14} className="text-blue-600" />;
    case 'txt': return <FileType2 size={14} className="text-gray-500" />;
    default: return <FileType size={14} className="text-gray-400" />;
  }
}

export default function MainSection({ darkMode, setMain, hasAccount, loggedIn, userId, preloadedChats, onRequireLogin }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState("Student");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMain(false);
  }, []);

  // Rotate placeholder suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const roles = personas.map(p => ({ label: p.label, icon: p.icon }));

  const handleFiles = useCallback((files) => {
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
  }, []);

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
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Send handler extracted for readability + keyboard shortcut
  const handleSend = useCallback(async () => {
    if (isUploading) return;

    if (selectedFiles.length === 0) {
      setError('Please upload at least one file before starting a chat.');
      return;
    }
    if (!chatMessage.trim()) {
      setError('Please enter a message before starting a chat.');
      return;
    }

    setError('');
    setIsUploading(true);

    if (!loggedIn) {
      try {
        const localChats = getUserChats(null);
        // Note: preloadedChats length tracking fallback logic ensures consistency if they somehow have chats cached in api array
        if (localChats.length >= 1 || (preloadedChats && preloadedChats.length >= 1)) {
          setError('You have reached the limit of 1 free chat. Please log in or sign up to create more.');
          setIsUploading(false);
          if (onRequireLogin) onRequireLogin('You have reached the limit of 1 free chat. Please log in or sign up to create more.');
          return;
        }
      } catch (err) {
        console.error('Error checking chat limit:', err);
      }
    }

    try {
      const response = await queryDocument({
        docs: selectedFiles,
        question: chatMessage,
        persona: selectedRole,
      });

      const chatId = response.chat_id || response.chatId || response.id || response._id;

      if (!chatId) {
        console.error('API response missing chat ID:', response);
        setError('Failed to create chat: No chat ID returned from server.');
        setIsUploading(false);
        return;
      }

      if (response.recommendations?.length > 0) {
        localStorage.setItem(
          `docDynamo_recommendations_${chatId}`,
          JSON.stringify(response.recommendations)
        );
      }

      if (response.additional_info) {
        localStorage.setItem(
          `docDynamo_additional_info_${chatId}`,
          JSON.stringify(response.additional_info)
        );
      }

      await saveChatWithCloudSync(
        chatId,
        { role: selectedRole, message: chatMessage },
        selectedFiles,
        userId
      );

      window.location.href = `/chat/${chatId}`;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create chat. Please try again.');
      setIsUploading(false);
    }
  }, [isUploading, selectedFiles, chatMessage, selectedRole, hasAccount, onRequireLogin]);

  // Keyboard shortcut: Enter to send (without Shift so Shift+Enter adds newline)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Auto-clear errors when the user takes corrective action
  useEffect(() => {
    if (error && (selectedFiles.length > 0 || chatMessage.trim())) {
      const timeout = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [selectedFiles, chatMessage, error]);

  const handleSelectPrompt = (promptText, roleName) => {
    setChatMessage(promptText);
    setSelectedRole(roleName);

    // The scrollable container is the <main> element wrapper in App.jsx
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className='flex flex-col w-full min-h-full'>
      <div className='flex justify-center items-center flex-1 w-full bg-background px-3 sm:px-6 lg:px-8 py-4'>
        <div className='flex flex-col justify-center items-center gap-4 sm:gap-6 max-w-7xl w-full'>
          {/* Hero Section Header*/}
          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 font-family-sans mt-2 animate-fadeIn'>
            <img
              src="/hero_2.png"
              alt="Contextual Intelligence"
              className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 drop-shadow-2xl'
            />
            <div className='flex flex-col justify-center items-center sm:items-start sm:gap-2'>
              <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#3258d5] to-accent font-extrabold text-center sm:text-left leading-tight'>
                Insight at the
              </span>
              <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-text font-extrabold font-display text-center sm:text-left leading-tight'>
                Speed of a Question
              </span>
            </div>
          </div>
          {/* Main interaction container */}
          <div
            className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 w-full max-w-4xl relative animate-fadeIn animation-delay-200 ${darkMode ? "bg-white/5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "bg-white/30 border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"}`}
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
                    <div className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-700 text-blue-400 group-hover:bg-gray-600' : 'bg-blue-50 text-[#3258d5] group-hover:bg-blue-100'}`}>
                      <Upload size={28} className={`sm:w-8 sm:h-8 transition-all duration-300 ${isDragging ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                      <p className='text-text font-semibold text-base sm:text-lg'>Drop files here</p>
                      <p className='text-text/60 text-xs sm:text-sm text-center'>or</p>
                      <button
                        type="button"
                        aria-label="Browse files to upload"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className='px-5 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-sm sm:text-base font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer'
                      >
                        Browse Files
                      </button>
                    </div>
                    <p className='text-text/40 text-xs text-center mt-1 sm:mt-2'>Supports up to 5 PDF, DOCX, or TXT files
                    </p>
                  </div>
                  : <div className='relative z-10 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 w-full'>
                    <div className='flex items-center gap-2 mb-1'>
                      <CheckCircle2 size={18} className='text-green-500' />
                      <p className='font-bold text-text'>
                        {selectedFiles.length === 1 ? '1 Document Selected' : `${selectedFiles.length} Documents Selected`}
                      </p>
                    </div>
                    <div className='flex flex-col gap-1.5 w-full max-w-xs'>
                      {selectedFiles.map((file) => (
                        <div
                          key={file.name}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'
                            }`}
                        >
                          {getFileIcon(file.name)}
                          <span className='truncate flex-1 text-text/80' title={file.name}>{file.name}</span>
                          <span className='text-text/40 text-xs shrink-0'>{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="Remove all selected files"
                      onClick={() => setSelectedFiles([])}
                      className='mt-1 px-5 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-sm sm:text-base font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2'
                    >
                      <X size={14} /> Reset
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
                      placeholder={placeholderSuggestions[placeholderIndex]}
                      aria-label="Type your question about the document"
                      className="flex-1 min-h-16 resize-none bg-transparent outline-none text-sm text-text placeholder:text-text/40 placeholder:transition-opacity"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />

                    {/* Custom Role Dropdown */}
                    <div className="flex items-center gap-2 mt-2">
                      <div ref={dropdownRef} className="relative flex-1 max-w-[240px]">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${darkMode
                            ? 'bg-gray-700 border border-gray-600/70 text-text hover:border-gray-500'
                            : 'bg-white border border-gray-300 text-text hover:border-gray-400'
                            }`}
                        >
                          <span className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="shrink-0 flex items-center">{roles.find(r => r.label === selectedRole)?.icon}</span>
                            <span className="truncate text-left">{selectedRole}</span>
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
                          <div className={`absolute bottom-full left-0 mb-1 z-50 min-w-full w-max max-w-[280px] rounded-lg shadow-lg max-h-48 overflow-y-auto ${darkMode
                            ? 'bg-gray-700 border border-gray-600'
                            : 'bg-white border border-gray-300'
                            }`}>
                            {roles.map((role) => (
                              <button
                                key={role.label}
                                type="button"
                                title={role.label}
                                onClick={() => {
                                  setSelectedRole(role.label);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full cursor-pointer px-3 py-2 text-sm flex items-center gap-2 transition-colors ${selectedRole === role.label
                                  ? darkMode
                                    ? 'bg-accent/20 text-blue-400'
                                    : 'bg-accent/10 text-accent'
                                  : darkMode
                                    ? 'text-text hover:bg-gray-600'
                                    : 'text-text hover:bg-gray-100'
                                  }`}
                              >
                                <span className="shrink-0 flex items-center">{role.icon}</span>
                                <span className="truncate text-left">{role.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Send Button */}
                      <button
                        disabled={isUploading}
                        aria-label="Send message and start chat"
                        title="Send (Enter)"
                        onClick={handleSend}
                        className={`p-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent hover:shadow-lg cursor-pointer shrink-0 transition-all duration-200 ${isUploading ? 'opacity-50 cursor-wait' : 'hover:scale-110 active:scale-95'}`}
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
          <div className='animate-fadeIn animation-delay-400 w-full flex flex-col items-center max-w-7xl'>
            {/* Prompt Suggestions Grid */}
            <PromptSuggestions
              darkMode={darkMode}
              onSelectPrompt={handleSelectPrompt}
              selectedRole={selectedRole}
            />
          </div>
          <FeaturesSection darkMode={darkMode} />
          <Footer />
        </div>
      </div>
    </div>
  )
}  
