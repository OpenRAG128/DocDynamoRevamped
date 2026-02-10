import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, SendHorizontalIcon, ZoomIn, ZoomOut, Download, Search, MousePointer, X, ChevronRight } from 'lucide-react';
import { getFilesFromIndexedDB, getUserChats } from '@/util/utils.js';
import PdfToolbar from '@/components/PdfToolbar.jsx';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker - use unpkg CDN which mirrors npm packages exactly
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


export default function ChatPage({ darkMode, setMain, userId }) {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [chat, setChat] = useState(null);
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
    const mobilePdfContainerRef = useRef(null);

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

    useEffect(() => {
        setMain(true);
        try {
            const savedChats = getUserChats(userId);
            const found = savedChats.find((c) => c.id === chatId);

            if (!found) {
                // Chat not found, navigate to home immediately
                navigate('/');
                return;
            }

            setChat(found);
            setMessages([
                { id: 'user-initial', role: 'user', text: found.message },
                {
                    id: 'assistant-welcome',
                    role: 'assistant',
                    text:
                        'This is a preview chat layout. In a full version, AI answers and document-grounded insights would appear here.',
                },
            ]);
        } catch (error) {
            console.error('Error loading chat:', error);
            navigate('/');
        }
    }, [chatId, navigate, userId]);

    useEffect(() => {
        let isMounted = true;

        const loadFiles = async () => {
            try {
                const files = await getFilesFromIndexedDB(chatId);
                if (isMounted) {
                    setChatFiles(files || []);
                    setSelectedFileIndex(0);
                }
            } catch (error) {
                console.error('Error loading files from IndexedDB:', error);
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

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: input.trim(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setInput('');
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

    if (!chat) {
        return (
            <div className={`flex flex-col h-full items-center justify-center ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
                <p className="mb-4 text-sm">Chat not found or has been cleared.</p>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-sm font-medium hover:shadow-md cursor-pointer"
                >
                    Go back home
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
                            {chatFiles?.[0]?.name || chat.files?.[0] || 'Uploaded file'}
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
                                <p className={`text-center text-sm leading-relaxed max-w-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No file preview available yet.
                                </p>
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
                            {chatFiles?.[0]?.name || chat.files?.[0] || 'Document'}
                        </span>
                        <ChevronRight size={16} className="shrink-0 text-text/40" />
                    </button>
                    {/* Desktop: Just show role */}
                    <div className="hidden md:block flex-1">
                        <p className="text-xs text-text/60">Chatting as <span className="font-medium text-text">{chat.role}</span></p>
                    </div>
                    {/* Mobile: Role badge */}
                    <div className={`md:hidden px-2 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                        {chat.role}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user'
                                ? 'bg-purple-600 text-white'
                                : darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                                }`}>
                                {m.role === 'user' ? (
                                    <span className="text-xs font-semibold">You</span>
                                ) : (
                                    <img src="/logo.svg" alt="DocDynamo" className="w-5 h-5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                )}
                            </div>
                            {/* Message content */}
                            <div className={`flex-1 max-w-[85%] ${m.role === 'user' ? 'text-right' : ''}`}>
                                <div
                                    className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : darkMode
                                            ? 'bg-gray-800/80 text-gray-100'
                                            : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                                        }`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Suggested prompts - Card style like the screenshot */}
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
                            className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-800 placeholder:text-gray-400'}`}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            className={`p-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${input.trim()
                                ? 'bg-gradient-to-r from-[#3258d5] to-accent text-white hover:shadow-md'
                                : darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
                                }`}
                            disabled={!input.trim()}
                        >
                            <SendHorizontalIcon size={18} />
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
                            <p className="text-gray-400 text-sm">No preview available</p>
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
