import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, SendHorizontalIcon, Download, X, ChevronRight, Upload, Loader2, PlayCircle, Info, HelpCircle, Lightbulb } from 'lucide-react';
import { getFilesFromIndexedDB, saveFilesToIndexedDB } from '@/util/utils.js';
import { sendChatMessage, getChatMessages, generateQuestions, generateConcepts } from '@/util/api.js';
import PdfToolbar from '@/components/PdfToolbar.jsx';
import ChatMessage from '@/components/ChatMessage.jsx';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker - use unpkg CDN which mirrors npm packages exactly
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


export default function ChatPage({ darkMode, setMain }) {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [chatRole, setChatRole] = useState('');
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatFiles, setChatFiles] = useState([]);
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);
    const [previewUrl, setPreviewUrl] = useState('');
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [pdfTextPages, setPdfTextPages] = useState([]);
    const [searchMatches, setSearchMatches] = useState([]);
    const [activeMatchIndex, setActiveMatchIndex] = useState(0);
    const scrollContainerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [pdfBaseWidth, setPdfBaseWidth] = useState(0);
    const [showMobilePdf, setShowMobilePdf] = useState(false);
    const [filesNotAvailable, setFilesNotAvailable] = useState(false);
    const mobilePdfContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(true);
    const [chatNotFound, setChatNotFound] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [additionalInfo, setAdditionalInfo] = useState(null);
    const [activeInfoTab, setActiveInfoTab] = useState(null);
    const [questions, setQuestions] = useState(null);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [concepts, setConcepts] = useState(null);
    const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);

    // Fetch questions and concepts when tabs are activated
    useEffect(() => {
        if (!chatId) return;

        if (activeInfoTab === 'questions' && !questions && !isLoadingQuestions) {
            setIsLoadingQuestions(true);
            generateQuestions()
                .then(res => setQuestions(res))
                .catch(e => console.error('Error generating questions:', e))
                .finally(() => setIsLoadingQuestions(false));
        }
        if (activeInfoTab === 'concepts' && !concepts && !isLoadingConcepts) {
            setIsLoadingConcepts(true);
            generateConcepts()
                .then(res => setConcepts(res))
                .catch(e => console.error('Error generating concepts:', e))
                .finally(() => setIsLoadingConcepts(false));
        }
    }, [activeInfoTab, questions, concepts, isLoadingQuestions, isLoadingConcepts, chatId]);

    // Track container width for responsive PDF sizing
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Account for padding (p-4 = 16px on each side)
                setContainerWidth(entry.contentRect.width - 32);
            }
        });

        observer.observe(container);
        // Initial measurement
        setContainerWidth(container.clientWidth - 32);

        return () => observer.disconnect();
    }, [previewUrl]); // Re-run when previewUrl changes to ensure ref is ready

    // Calculate effective scale: fit to container width, then apply user zoom
    const getEffectiveScale = () => {
        if (!pdfBaseWidth || !containerWidth) return 1;
        const fitScale = containerWidth / pdfBaseWidth;
        return fitScale * (zoom / 100);
    };

    // Get width for Page component (more reliable than scale alone)
    const getPageWidth = () => {
        if (!containerWidth) return undefined;
        return containerWidth * (zoom / 100);
    };

    // Scroll to a specific page
    const scrollToPage = (pageNum) => {
        const pageElement = document.getElementById(`pdf-page-${pageNum}`);
        if (pageElement && scrollContainerRef.current) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const extractPdfText = async (pdf) => {
        const texts = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(' ');
            texts.push({ page: i, text: pageText });
        }

        return texts;
    };

    const handleSearch = (query) => {
        // Clear search if empty query
        if (!query || !query.trim()) {
            setSearchQuery('');
            setSearchMatches([]);
            setActiveMatchIndex(0);
            return;
        }

        setSearchQuery(query);

        const found = [];

        pdfTextPages.forEach(({ page, text }) => {
            let index = text.toLowerCase().indexOf(query.toLowerCase());
            while (index !== -1) {
                found.push({ page, index });
                index = text.toLowerCase().indexOf(query.toLowerCase(), index + 1);
            }
        });

        setSearchMatches(found);
        setActiveMatchIndex(0);

        // Scroll to the first match after a short delay to allow highlights to render
        if (found.length > 0) {
            setTimeout(() => {
                const firstHighlight = document.querySelector('.pdf-highlight-overlay');
                if (firstHighlight) {
                    firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Fallback: scroll to the page containing the first match
                    scrollToPage(found[0].page);
                }
            }, 200);
        }
    };

    // Highlight search matches in the rendered PDF text layer
    useEffect(() => {
        // Small delay to ensure text layer is rendered
        const timeout = setTimeout(() => {
            // Remove any existing highlight overlays
            document.querySelectorAll('.pdf-highlight-overlay').forEach(el => el.remove());

            if (!searchQuery) return;

            const textLayers = document.querySelectorAll('.react-pdf__Page__textContent');

            textLayers.forEach((textLayer) => {
                const spans = textLayer.querySelectorAll('span');

                spans.forEach((span) => {
                    const text = span.textContent;
                    if (!text) return;

                    const lowerText = text.toLowerCase();
                    const lowerQuery = searchQuery.toLowerCase();
                    let index = lowerText.indexOf(lowerQuery);

                    while (index !== -1) {
                        // Create a range for just the matching text
                        const range = document.createRange();
                        const textNode = span.firstChild;

                        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                            try {
                                range.setStart(textNode, index);
                                range.setEnd(textNode, index + searchQuery.length);

                                const rect = range.getBoundingClientRect();
                                const layerRect = textLayer.getBoundingClientRect();

                                // Create highlight overlay
                                const highlight = document.createElement('div');
                                highlight.className = 'pdf-highlight-overlay';
                                highlight.style.cssText = `
                                    position: absolute;
                                    left: ${rect.left - layerRect.left}px;
                                    top: ${rect.top - layerRect.top}px;
                                    width: ${rect.width}px;
                                    height: ${rect.height}px;
                                    background-color: rgba(255, 255, 0, 0.4);
                                    pointer-events: none;
                                    border-radius: 2px;
                                `;
                                textLayer.appendChild(highlight);
                            } catch (e) {
                                // Range error - skip this match
                            }
                        }

                        index = lowerText.indexOf(lowerQuery, index + 1);
                    }
                });
            });
        }, 150);

        return () => clearTimeout(timeout);
    }, [searchQuery, totalPages, zoom]);

    // Load recommendations and additional info from localStorage
    useEffect(() => {
        if (!chatId) return;
        try {
            const stored = localStorage.getItem(`docDynamo_recommendations_${chatId}`);
            if (stored) {
                setRecommendations(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Error loading recommendations:', e);
        }
        try {
            const storedInfo = localStorage.getItem(`docDynamo_additional_info_${chatId}`);
            if (storedInfo) {
                setAdditionalInfo(JSON.parse(storedInfo));
            }
        } catch (e) {
            console.error('Error loading additional info:', e);
        }
    }, [chatId]);

    // Load messages from backend API
    useEffect(() => {
        setMain(true);
        const loadChatMessages = async () => {
            if (!chatId) return;

            setIsLoadingChat(true);
            try {
                const data = await getChatMessages(chatId);

                if (!data || !data.messages) {
                    throw new Error("No messages found in API");
                }

                // Set chat persona/role if returned by API
                if (data.persona) {
                    setChatRole(data.persona);
                }

                // Convert backend messages to UI format
                const formattedMessages = data.messages.map((msg, index) => ({
                    id: `${msg.role}-${msg.created_at || index}`,
                    role: msg.role === 'model' || msg.role === 'bot' ? 'assistant' : msg.role,
                    text: msg.content || msg.response || msg.message || msg.answer || msg.text || '',
                }));

                setMessages(formattedMessages);
            } catch (error) {
                console.error('Error loading chat messages from API:', error);

                // Fallback for legacy local-only chats
                try {
                    // Search all possible storage keys
                    const keysToCheck = ["docDynamoChats", "docDynamoChats_guest"];
                    const uid = JSON.parse(localStorage.getItem('loginState') || '{}')?.userId;
                    if (uid) keysToCheck.push(`docDynamoChats_${uid}`);

                    let foundLocalChat = null;
                    for (const key of keysToCheck) {
                        const localChatsStr = localStorage.getItem(key);
                        if (localChatsStr) {
                            const localChats = JSON.parse(localChatsStr);
                            foundLocalChat = localChats.find(c => c.id === chatId);
                            if (foundLocalChat) break;
                        }
                    }

                    if (foundLocalChat) {
                        setChatRole(foundLocalChat.role || 'General');

                        // Reconstruct initial message for legacy chat if exists
                        if (foundLocalChat.message) {
                            setMessages([
                                { id: `user-0`, role: 'user', text: foundLocalChat.message }
                            ]);
                        } else {
                            setMessages([]);
                        }
                        // Reset chat not found since it's a legacy chat
                        setChatNotFound(false);
                    } else {
                        setChatNotFound(true);
                    }
                } catch (fallbackError) {
                    console.error("Local fallback error:", fallbackError);
                    setChatNotFound(true);
                }

            } finally {
                setIsLoadingChat(false);
            }
        };

        loadChatMessages();
    }, [chatId, setMain]);

    // Load files from local IndexedDB (files are stored locally for preview)
    useEffect(() => {
        let isMounted = true;

        const loadFiles = async () => {
            try {
                const files = await getFilesFromIndexedDB(chatId);
                if (isMounted) {
                    setChatFiles(files || []);
                    setSelectedFileIndex(0);

                    // Check if files are available locally
                    if (!files || files.length === 0) {
                        setFilesNotAvailable(true);
                    } else {
                        setFilesNotAvailable(false);
                    }
                }
            } catch (error) {
                console.error('Error loading files:', error);
            }
        };

        if (chatId) {
            loadFiles();
        }

        return () => {
            isMounted = false;
        };
    }, [chatId]);

    useEffect(() => {
        if (!chatFiles.length) {
            setPreviewUrl('');
            setTotalPages(1);
            setPdfBaseWidth(0);
            return undefined;
        }

        const current = chatFiles[selectedFileIndex];
        const blob = current?.data instanceof Blob
            ? current.data
            : new Blob([current?.data ?? ''], { type: current?.type || 'application/octet-stream' });

        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setCurrentPage(1);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [chatFiles, selectedFileIndex]);

    // Auto-scroll to latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: input.trim(),
        };
        setMessages((prev) => [...prev, userMessage]);
        const question = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            // Send message via backend API
            const response = await sendChatMessage({
                chatId,
                question,
                persona: chatRole,
            });

            // Handle different possible response field names from the backend
            const responseText = response.response
                || response.message
                || response.content
                || response.answer
                || 'No response received.';

            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                text: responseText,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Query error:', error);
            const errorMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages]);

    const handleDownload = () => {
        if (!previewUrl || !chatFiles[selectedFileIndex]) return;
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = chatFiles[selectedFileIndex].name;
        link.click();
    };

    const handleReupload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            await saveFilesToIndexedDB(files, chatId);
            // Reload files after upload
            const updatedFiles = await getFilesFromIndexedDB(chatId);
            setChatFiles(updatedFiles || []);
            setSelectedFileIndex(0);
            setFilesNotAvailable(false);
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (chatNotFound) {
        return (
            <div className={`flex flex-col h-full items-center justify-center ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
                <p className="mb-2 text-sm font-medium">Chat not found</p>
                <p className="mb-4 text-xs text-text/60 text-center max-w-xs">This chat may have expired or doesn&apos;t exist. Please start a new conversation.</p>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-4 py-2 rounded-lg bg-linear-to-r from-[#3258d5] to-accent text-white text-sm font-medium hover:shadow-md cursor-pointer"
                >
                    Start new chat
                </button>
            </div>
        );
    }

    return (
        <div className={`flex h-full w-full ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
            {/* Document column - Hidden on mobile */}
            <section
                className={`hidden md:flex flex-col w-0 flex-[1.2] border-r overflow-hidden ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    {chatFiles.length > 1 ? (
                        <select
                            value={selectedFileIndex}
                            onChange={(e) => setSelectedFileIndex(Number(e.target.value))}
                            className={`text-sm rounded-lg border px-3 py-1.5 outline-none transition-colors ${darkMode
                                ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-750'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {chatFiles.map((file, index) => (
                                <option key={file.id || `${file.name}-${index}`} value={index}>
                                    {file.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span className={`text-sm font-medium truncate max-w-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {chatFiles?.[0]?.name || 'Uploaded file'}
                        </span>
                    )}
                </div>

                {/* Document preview */}
                <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                    <div ref={scrollContainerRef} className="flex-1 overflow-auto flex items-start justify-center p-4">
                        {previewUrl ? (
                            chatFiles[selectedFileIndex]?.type?.startsWith('image/') ? (
                                <div className="flex items-center justify-center">
                                    <img
                                        src={previewUrl}
                                        alt={chatFiles[selectedFileIndex]?.name || 'Document preview'}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ transform: `scale(${zoom / 100})` }}
                                    />
                                </div>
                            ) : (
                                <Document
                                    file={previewUrl}
                                    onLoadSuccess={async (pdf) => {
                                        setTotalPages(pdf.numPages);
                                        setCurrentPage(1);

                                        // Get the first page to determine base width
                                        const firstPage = await pdf.getPage(1);
                                        const viewport = firstPage.getViewport({ scale: 1 });
                                        setPdfBaseWidth(viewport.width);

                                        const textPages = await extractPdfText(pdf);
                                        setPdfTextPages(textPages);
                                    }}
                                    loading={
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Loading PDF…
                                        </p>
                                    }
                                    error={
                                        <p className="text-sm text-red-500">
                                            Failed to load PDF
                                        </p>
                                    }
                                    className="flex flex-col items-center gap-4"
                                >
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <div key={`page-wrapper-${index + 1}`} id={`pdf-page-${index + 1}`}>
                                            <Page
                                                pageNumber={index + 1}
                                                width={getPageWidth()}
                                                renderTextLayer={true}
                                                renderAnnotationLayer={false}
                                                className="shadow-md"
                                            />
                                        </div>
                                    ))}
                                </Document>
                            )
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                {filesNotAvailable ? (
                                    <div className={`text-center p-6 rounded-xl border max-w-sm ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                                        <FileText size={40} className="mx-auto mb-3 text-accent/60" />
                                        <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Files not available on this device
                                        </p>
                                        <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Documents are stored locally for privacy. Please re-upload your files to continue.
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept=".pdf,image/*"
                                            onChange={handleReupload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-[#3258d5] to-accent text-white text-sm font-medium hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Upload size={16} />
                                            {isUploading ? 'Uploading...' : 'Re-upload Files'}
                                        </button>
                                    </div>
                                ) : (
                                    <p className={`text-center text-sm leading-relaxed max-w-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No file preview available yet.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pdf Toolbar */}
                    <PdfToolbar
                        visible={!!previewUrl}
                        zoom={zoom}
                        setZoom={setZoom}
                        currentPage={currentPage}
                        setCurrentPage={(page) => {
                            setCurrentPage(page);
                            scrollToPage(page);
                        }}
                        totalPages={totalPages}
                        onDownload={handleDownload}
                        onSearch={handleSearch}
                        searchQuery={searchQuery}
                        darkMode={darkMode}
                        minZoom={50}
                        maxZoom={200}
                    />

                </div>
            </section>

            {/* Chat column */}
            <section className={`flex flex-col flex-1 md:flex-[0.9] ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                {/* Chat header - Shows document name on mobile */}
                <div className={`px-4 py-3 border-b flex items-center gap-3 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    {/* Back button - Mobile only */}
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className={`md:hidden p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    {/* File button - clickable to open PDF viewer */}
                    <button
                        type="button"
                        onClick={() => setShowMobilePdf(true)}
                        className={`md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-0 transition-colors ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-200' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'}`}
                    >
                        <FileText size={16} className="text-accent shrink-0" />
                        <span className="text-sm font-medium truncate flex-1 text-left">
                            {chatFiles?.[0]?.name || 'Document'}
                        </span>
                        <ChevronRight size={16} className="shrink-0 text-text/40" />
                    </button>
                    {/* Desktop: Just show role */}
                    {chatRole && (
                        <div className="hidden md:block flex-1">
                            <p className="text-xs text-text/60">Chatting as <span className="font-medium text-text">{chatRole}</span></p>
                        </div>
                    )}
                    {/* Mobile: Role badge */}
                    {chatRole && (
                        <div className={`md:hidden px-2 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                            {chatRole}
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
                    {isLoadingChat ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 size={24} className="animate-spin text-purple-500" />
                        </div>
                    ) : messages.map((m, index) => {
                        // Show recommendations right after the first assistant message
                        const isFirstAssistant = m.role === 'assistant' && messages.findIndex(msg => msg.role === 'assistant') === index;
                        return (
                            <div key={m.id}>
                                <ChatMessage message={m} darkMode={darkMode} setInput={setInput} />
                                {isFirstAssistant && (
                                    <div className={`flex gap-3 mt-4`}>
                                        <div className="shrink-0 w-8" />
                                        <div className="flex-1 flex flex-col gap-2">
                                            {/* Toggle buttons - visually polished */}
                                            <div className={`flex gap-2 rounded-xl p-3 border ${darkMode ? 'bg-gray-900/70 border-gray-800/80' : 'bg-white border-gray-200/80'} shadow-sm`}>
                                                {recommendations.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveInfoTab(activeInfoTab === 'videos' ? null : 'videos')}
                                                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all duration-150 cursor-pointer border-2
                                                            ${activeInfoTab === 'videos'
                                                                ? darkMode
                                                                    ? 'bg-red-500/20 text-red-500 border-red-500 shadow-md'
                                                                    : 'bg-red-50 text-red-600 border-red-400 shadow-md'
                                                                : darkMode
                                                                    ? 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:border-red-500'
                                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:border-red-400'}
                                                        `}
                                                        style={{ boxShadow: activeInfoTab === 'videos' ? (darkMode ? '0 2px 8px rgba(255,0,0,0.08)' : '0 2px 8px rgba(255,0,0,0.10)') : undefined }}
                                                    >
                                                        <PlayCircle size={17} className={activeInfoTab === 'videos' ? (darkMode ? 'text-red-400' : 'text-red-500') : 'text-gray-400'} />
                                                        <span>Related Videos</span>
                                                    </button>
                                                )}
                                                {additionalInfo && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveInfoTab(activeInfoTab === 'info' ? null : 'info')}
                                                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all duration-150 cursor-pointer border-2
                                                            ${activeInfoTab === 'info'
                                                                ? darkMode
                                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500 shadow-md'
                                                                    : 'bg-blue-50 text-blue-600 border-blue-400 shadow-md'
                                                                : darkMode
                                                                    ? 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:border-blue-500'
                                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-400'}
                                                        `}
                                                        style={{ boxShadow: activeInfoTab === 'info' ? (darkMode ? '0 2px 8px rgba(0,80,255,0.08)' : '0 2px 8px rgba(0,80,255,0.10)') : undefined }}
                                                    >
                                                        <Info size={17} className={activeInfoTab === 'info' ? (darkMode ? 'text-blue-400' : 'text-blue-500') : 'text-gray-400'} />
                                                        <span>Additional Info</span>
                                                    </button>
                                                )}
                                                {/* Questions */}
                                                {/* <button
                                                    type="button"
                                                    onClick={() => setActiveInfoTab(activeInfoTab === 'questions' ? null : 'questions')}
                                                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all duration-150 cursor-pointer border-2
                                                        ${activeInfoTab === 'questions'
                                                            ? darkMode
                                                                ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500 shadow-md'
                                                                : 'bg-yellow-50 text-yellow-600 border-yellow-400 shadow-md'
                                                            : darkMode
                                                                ? 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:border-yellow-500'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-yellow-50 hover:border-yellow-400'}
                                                    `}
                                                    style={{ boxShadow: activeInfoTab === 'questions' ? (darkMode ? '0 2px 8px rgba(234,179,8,0.08)' : '0 2px 8px rgba(234,179,8,0.10)') : undefined }}
                                                >
                                                    <HelpCircle size={17} className={activeInfoTab === 'questions' ? (darkMode ? 'text-yellow-400' : 'text-yellow-500') : 'text-gray-400'} />
                                                    <span>Questions</span>
                                                </button> */}
                                                {/* Concepts */}
                                                {/* <button
                                                    type="button"
                                                    onClick={() => setActiveInfoTab(activeInfoTab === 'concepts' ? null : 'concepts')}
                                                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all duration-150 cursor-pointer border-2
                                                        ${activeInfoTab === 'concepts'
                                                            ? darkMode
                                                                ? 'bg-green-500/20 text-green-500 border-green-500 shadow-md'
                                                                : 'bg-green-50 text-green-600 border-green-400 shadow-md'
                                                            : darkMode
                                                                ? 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:border-green-500'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-400'}
                                                    `}
                                                    style={{ boxShadow: activeInfoTab === 'concepts' ? (darkMode ? '0 2px 8px rgba(34,197,94,0.08)' : '0 2px 8px rgba(34,197,94,0.10)') : undefined }}
                                                >
                                                    <Lightbulb size={17} className={activeInfoTab === 'concepts' ? (darkMode ? 'text-green-400' : 'text-green-500') : 'text-gray-400'} />
                                                    <span>Concepts</span>
                                                </button> */}
                                            </div>

                                            {/* Related Videos panel */}
                                            {activeInfoTab === 'videos' && recommendations.length > 0 && (
                                                <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-900/60 border border-gray-800/80' : 'bg-gray-50 border border-gray-200/80'}`}>
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <div className={`p-1 rounded-md ${darkMode ? 'bg-red-500/15' : 'bg-red-50'}`}>
                                                            <PlayCircle size={13} className="text-red-500" />
                                                        </div>
                                                        <h3 className={`text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Related Videos</h3>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {recommendations.slice(0, 6).map((rec) => (
                                                            <a
                                                                key={rec.video_id}
                                                                href={`https://www.youtube.com/watch?v=${rec.video_id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`group relative rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ring-1 ${darkMode
                                                                    ? 'ring-gray-700/60 hover:ring-red-500/40'
                                                                    : 'ring-gray-200 hover:ring-red-400/40'
                                                                    }`}
                                                            >
                                                                <div className="relative aspect-video">
                                                                    <img
                                                                        src={rec.thumbnail_url}
                                                                        alt="Video thumbnail"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                        <div className="w-8 h-8 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                                                            <PlayCircle size={18} className="text-white" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Info panel */}
                                            {activeInfoTab === 'info' && additionalInfo && (
                                                <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-900/60 border border-gray-800/80' : 'bg-gray-50 border border-gray-200/80'}`}>
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <div className={`p-1 rounded-md ${darkMode ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
                                                            <Info size={13} className="text-blue-500" />
                                                        </div>
                                                        <h3 className={`text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Additional Info</h3>
                                                    </div>
                                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {typeof additionalInfo === 'string' ? additionalInfo : JSON.stringify(additionalInfo, null, 2)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Questions panel */}
                                            {activeInfoTab === 'questions' && (
                                                <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-900/60 border border-gray-800/80' : 'bg-gray-50 border border-gray-200/80'}`}>
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <div className={`p-1 rounded-md ${darkMode ? 'bg-yellow-500/15' : 'bg-yellow-50'}`}>
                                                            <HelpCircle size={13} className="text-yellow-500" />
                                                        </div>
                                                        <h3 className={`text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Questions</h3>
                                                    </div>
                                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {isLoadingQuestions ? (
                                                            <div className="flex items-center gap-2 text-yellow-500/70">
                                                                <Loader2 size={14} className="animate-spin" />
                                                                <span>Generating questions...</span>
                                                            </div>
                                                        ) : (
                                                            questions ? (
                                                                typeof questions === 'string' ? questions : JSON.stringify(questions, null, 2)
                                                            ) : (
                                                                <span className="italic opacity-60">No questions available.</span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Concepts panel */}
                                            {activeInfoTab === 'concepts' && (
                                                <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-900/60 border border-gray-800/80' : 'bg-gray-50 border border-gray-200/80'}`}>
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <div className={`p-1 rounded-md ${darkMode ? 'bg-green-500/15' : 'bg-green-50'}`}>
                                                            <Lightbulb size={13} className="text-green-500" />
                                                        </div>
                                                        <h3 className={`text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Concepts</h3>
                                                    </div>
                                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {isLoadingConcepts ? (
                                                            <div className="flex items-center gap-2 text-green-500/70">
                                                                <Loader2 size={14} className="animate-spin" />
                                                                <span>Generating concepts...</span>
                                                            </div>
                                                        ) : (
                                                            concepts ? (
                                                                typeof concepts === 'string' ? concepts : JSON.stringify(concepts, null, 2)
                                                            ) : (
                                                                <span className="italic opacity-60">No concepts available.</span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* Loading indicator - only show when sending a message */}
                    {!isLoadingChat && isLoading && (
                        <div className="flex gap-3">
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                <img src="/logo.svg" alt="DocDynamo" className="w-5 h-5" />
                            </div>
                            <div className={`inline-flex items-center gap-1 rounded-2xl px-4 py-3 ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested prompts - only show when no messages and not loading */}
                {!isLoadingChat && messages.length === 0 && (
                    <div className={`px-4 pb-3 space-y-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        <div className="flex flex-col gap-2">
                            {[
                                { icon: "✨", label: "Summarize the key points", highlight: true },
                                { icon: "📋", label: "What are the main rules or guidelines?" },
                                { icon: "❓", label: "Explain any complex sections" }
                            ].map((prompt) => (
                                <button
                                    key={prompt.label}
                                    type="button"
                                    onClick={() => setInput(prompt.label)}
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${prompt.highlight
                                        ? darkMode
                                            ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                                            : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                                        : darkMode
                                            ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-base">{prompt.icon}</span>
                                    <span>{prompt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className={`px-4 pb-4 pt-2 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                    <div
                        className={`flex items-center gap-2 rounded-xl px-4 py-3 border shadow-sm ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Ask any question..."
                            disabled={isLoading}
                            className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-800 placeholder:text-gray-400'} disabled:opacity-50`}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            className={`p-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${input.trim() && !isLoading
                                ? 'bg-linear-to-r from-[#3258d5] to-accent text-white hover:shadow-md'
                                : darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
                                }`}
                            disabled={!input.trim() || isLoading}
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontalIcon size={18} />}
                        </button>
                    </div>
                </div>
            </section>

            {/* Mobile PDF Viewer Modal */}
            {showMobilePdf && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-black/90">
                    {/* Modal header */}
                    <div className={`flex items-center justify-between px-4 py-3 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <FileText size={16} className="text-accent shrink-0" />
                            <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                {chatFiles?.[selectedFileIndex]?.name || 'Document'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDownload}
                                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <Download size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowMobilePdf(false)}
                                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* PDF content */}
                    <div ref={mobilePdfContainerRef} className="flex-1 overflow-auto flex items-start justify-center p-4">
                        {previewUrl ? (
                            chatFiles[selectedFileIndex]?.type?.startsWith('image/') ? (
                                <img
                                    src={previewUrl}
                                    alt={chatFiles[selectedFileIndex]?.name || 'Document preview'}
                                    className="max-w-full object-contain"
                                />
                            ) : (
                                <Document
                                    file={previewUrl}
                                    onLoadSuccess={(pdf) => setTotalPages(pdf.numPages)}
                                    loading={
                                        <p className="text-sm text-gray-400">Loading PDF…</p>
                                    }
                                    error={
                                        <p className="text-sm text-red-500">Failed to load PDF</p>
                                    }
                                    className="flex flex-col items-center gap-4"
                                >
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <Page
                                            key={`mobile-page-${index + 1}`}
                                            pageNumber={index + 1}
                                            width={Math.min(window.innerWidth - 32, 600)}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            className="shadow-lg"
                                        />
                                    ))}
                                </Document>
                            )
                        ) : (
                            <div className="text-center p-6">
                                {filesNotAvailable ? (
                                    <div className={`rounded-xl border p-6 max-w-sm ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        <FileText size={40} className="mx-auto mb-3 text-accent/60" />
                                        <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Files not available
                                        </p>
                                        <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Please re-upload your files on this device.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-[#3258d5] to-accent text-white text-sm font-medium hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Upload size={16} />
                                            {isUploading ? 'Uploading...' : 'Re-upload Files'}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">No preview available</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Page indicator */}
                    {totalPages > 1 && (
                        <div className={`text-center py-2 text-sm ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'}`}>
                            Page {currentPage} of {totalPages}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
