import { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Download, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PdfToolbar({
    visible,
    zoom,
    setZoom,
    currentPage,
    setCurrentPage,
    totalPages,
    onDownload,
    onSearch,
    searchQuery,
    darkMode = false,
    minZoom = 100,
    maxZoom = 200,
}) {
    const [pageInput, setPageInput] = useState(String(currentPage));
    const [showSearch, setShowSearch] = useState(false);
    const [searchInput, setSearchInput] = useState(searchQuery || "");

    /* -------------------- Search (debounced) -------------------- */
    useEffect(() => {
        if (!showSearch || !searchInput.trim()) return;

        const id = setTimeout(() => {
            onSearch?.(searchInput.trim());
        }, 300);

        return () => clearTimeout(id);
    }, [searchInput, showSearch]);

    useEffect(() => {
        setSearchInput(searchQuery || "");
    }, [searchQuery]);

    /* -------------------- Page input sync -------------------- */
    useEffect(() => {
        setPageInput(String(currentPage));
    }, [currentPage]);

    if (!visible) return null;

    /* -------------------- Helpers -------------------- */
    const isZoomOutDisabled = zoom <= minZoom;
    const isZoomInDisabled = zoom >= maxZoom;

    const baseBtn = "p-1.5 rounded transition-colors active:scale-95";

    const enabledBtn = darkMode
        ? "text-gray-300 hover:bg-gray-700"
        : "text-gray-600 hover:bg-gray-100";

    const disabledBtn = darkMode
        ? "text-gray-500 cursor-not-allowed"
        : "text-gray-400 cursor-not-allowed";

    const handleClearSearch = () => {
        setSearchInput("");
        onSearch?.("");
        setShowSearch(false);
    };

    /* -------------------- PAGE COMMIT (CRITICAL) -------------------- */
    const commitPageChange = (forceBlur = false) => {
        if (pageInput.trim() === "") {
            setPageInput(String(currentPage));
            return;
        }

        const value = Number(pageInput);

        if (!Number.isInteger(value)) {
            setPageInput(String(currentPage));
            return;
        }

        const clamped = Math.max(1, Math.min(totalPages, value));

        if (clamped !== currentPage) {
            setCurrentPage(clamped);
        }

        setPageInput(String(clamped));

        if (forceBlur && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    };

    return (
        <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10
      flex items-center gap-1 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm border
      ${darkMode
                    ? "bg-gray-800/90 border-gray-700/50"
                    : "bg-white/90 border-gray-200/50"}`}
        >
            {/* -------------------- Search Input -------------------- */}
            {showSearch && (
                <>
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all
            ${darkMode
                                ? "bg-gray-700/80 border-gray-600"
                                : "bg-white border-gray-300 shadow-sm"}`}
                    >
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onSearch?.(searchInput.trim());
                                if (e.key === "Escape") handleClearSearch();
                            }}
                            placeholder="Search in document…"
                            autoFocus
                            className={`w-48 sm:w-56 bg-transparent px-1 text-sm outline-none
              ${darkMode
                                    ? "text-gray-200 placeholder:text-gray-400"
                                    : "text-gray-800 placeholder:text-gray-400"}`}
                        />

                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={handleClearSearch}
                            className={`${baseBtn} ${enabledBtn}`}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <Divider darkMode={darkMode} />
                </>
            )}

            {/* -------------------- Zoom Out -------------------- */}
            <button
                type="button"
                aria-label="Zoom out"
                disabled={isZoomOutDisabled}
                onClick={() => setZoom(Math.max(minZoom, zoom - 10))}
                className={`${baseBtn} ${isZoomOutDisabled ? disabledBtn : enabledBtn}`}
            >
                <ZoomOut size={16} />
            </button>

            {/* -------------------- Zoom In -------------------- */}
            <button
                type="button"
                aria-label="Zoom in"
                disabled={isZoomInDisabled}
                onClick={() => setZoom(Math.min(maxZoom, zoom + 10))}
                className={`${baseBtn} ${isZoomInDisabled ? disabledBtn : enabledBtn}`}
            >
                <ZoomIn size={16} />
            </button>

            <Divider darkMode={darkMode} />

            {/* -------------------- Page Navigation -------------------- */}
            <button
                type="button"
                aria-label="Previous page"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`${baseBtn} ${currentPage === 1 ? disabledBtn : enabledBtn}`}
            >
                <ChevronLeft size={16} />
            </button>

            {/* -------------------- Page Selector -------------------- */}
            <div
                className={`flex items-center gap-1 text-sm
        ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
                <input
                    type="text"
                    inputMode="numeric"
                    value={pageInput}
                    onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                            setPageInput(e.target.value);
                        }
                    }}
                    onBlur={() => commitPageChange()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            commitPageChange(true);
                        }
                        if (e.key === "Escape") {
                            setPageInput(String(currentPage));
                            e.currentTarget.blur();
                        }
                    }}
                    className={`w-8 text-center bg-transparent border-none outline-none
          ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    aria-label="Page number"
                />
                <span className="whitespace-nowrap">of {totalPages}</span>
            </div>

            <button
                type="button"
                aria-label="Next page"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`${baseBtn} ${currentPage === totalPages ? disabledBtn : enabledBtn}`}
            >
                <ChevronRight size={16} />
            </button>

            <Divider darkMode={darkMode} />

            {/* -------------------- Download -------------------- */}
            {onDownload && (
                <button
                    type="button"
                    aria-label="Download PDF"
                    onClick={onDownload}
                    className={`${baseBtn} ${enabledBtn}`}
                >
                    <Download size={16} />
                </button>
            )}

            {/* -------------------- Search Toggle -------------------- */}
            {onSearch && (
                <button
                    type="button"
                    aria-label="Search document"
                    onClick={() => setShowSearch((v) => !v)}
                    className={`${baseBtn} ${showSearch
                        ? darkMode
                            ? "bg-gray-700"
                            : "bg-gray-200"
                        : ""
                        } ${enabledBtn}`}
                >
                    <Search size={16} />
                </button>
            )}
        </div>
    );
}

function Divider({ darkMode }) {
    return (
        <div
            className={`w-px h-5 mx-1 ${darkMode ? "bg-gray-600" : "bg-gray-300"
                }`}
        />
    );
}