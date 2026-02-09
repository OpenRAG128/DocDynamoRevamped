import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, SendHorizontalIcon, ZoomIn, ZoomOut, Download, Search, MousePointer } from 'lucide-react';
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
            {/* Document column */}
            <section
                className={`flex flex-col w-0 flex-[1.2] border-r overflow-hidden ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}
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
            <section className={`flex flex-col flex-[0.9] ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                {/* Chat header */}
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <p className="text-xs text-text/60 mb-1">Chatting as</p>
                    <p className="text-sm font-semibold text-text">{chat.role}</p>
                    <p className="mt-1 text-xs sm:text-[13px] text-text/60 truncate max-w-lg">
                        {chat.message}
                    </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
                    {messages.map((m) => (
                        <div key={m.id} className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wide text-text/40">
                                {m.role === 'user' ? 'You' : 'DocDynamo'}
                            </span>
                            <div
                                className={`max-w-full rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user'
                                    ? darkMode
                                        ? 'bg-purple-600/80 text-white self-end'
                                        : 'bg-purple-600 text-white self-end'
                                    : darkMode
                                        ? 'bg-gray-800 text-gray-100'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                            >
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Suggested prompts */}
                <div className={`px-4 pb-2 space-y-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <p className="text-xs text-text/60">Try asking</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {["Summarize this grade report", "Which section stands out most?", "Explain the key takeaways"]
                            .map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setInput(label)}
                                    className={`px-3 py-1 rounded-full border text-xs cursor-pointer ${darkMode
                                        ? 'border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-200'
                                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                    </div>
                </div>

                {/* Input */}
                <div className={`px-4 pb-4 pt-1 border-t ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
                    <div
                        className={`flex items-end gap-2 rounded-xl px-3 py-2 border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                        <textarea
                            rows={2}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask any question about your document..."
                            className={`flex-1 resize-none bg-transparent outline-none text-sm ${darkMode ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-800 placeholder:text-gray-400'}`}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            className="p-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white hover:shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={!input.trim()}
                        >
                            <SendHorizontalIcon size={18} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
