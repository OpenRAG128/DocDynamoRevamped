import { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Download, Search } from "lucide-react";

export default function PdfToolbar({
    visible,
    zoom,
    setZoom,
    currentPage,
    setCurrentPage,
    totalPages,
    onDownload,
    onSearch,
    darkMode = false,
    minZoom = 100,
    maxZoom = 200,
}) {
    const [pageInput, setPageInput] = useState(currentPage);

    useEffect(() => {
        setPageInput(currentPage);
    }, [currentPage]);

    if (!visible) return null;

    const isZoomOutDisabled = zoom <= minZoom;
    const isZoomInDisabled = zoom >= maxZoom;

    const baseBtn =
        "p-1.5 rounded transition-colors active:scale-95";

    const enabledBtn = darkMode
        ? "text-gray-300 hover:bg-gray-700"
        : "text-gray-600 hover:bg-gray-100";

    const disabledBtn = darkMode
        ? "text-gray-500 cursor-not-allowed"
        : "text-gray-400 cursor-not-allowed";

    return (
        <div
            className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 
        flex items-center gap-1 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm border
        ${darkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/50"}`}
        >
            {/* Zoom Out */}
            <button
                type="button"
                aria-label="Zoom out"
                disabled={isZoomOutDisabled}
                onClick={() => setZoom(Math.max(minZoom, zoom - 10))}
                className={`${baseBtn} ${isZoomOutDisabled ? disabledBtn : enabledBtn}`}
                title={isZoomOutDisabled ? "Minimum zoom reached" : "Zoom out"}
            >
                <ZoomOut size={16} />
            </button>

            {/* Zoom In */}
            <button
                type="button"
                aria-label="Zoom in"
                disabled={isZoomInDisabled}
                onClick={() => setZoom(Math.min(maxZoom, zoom + 10))}
                className={`${baseBtn} ${isZoomInDisabled ? disabledBtn : enabledBtn}`}
                title={isZoomInDisabled ? "Maximum zoom reached" : "Zoom in"}
            >
                <ZoomIn size={16} />
            </button>

            <Divider darkMode={darkMode} />

            {/* Page Selector */}
            <div
                className={`flex items-center gap-1.5 px-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
            >
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() =>
                        setCurrentPage(
                            Math.max(1, Math.min(totalPages, Number(pageInput) || 1))
                        )
                    }
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    className="w-10 text-center bg-transparent border-none outline-none"
                />
                <span>of {totalPages}</span>
            </div>

            <Divider darkMode={darkMode} />

            {/* Download */}
            {onDownload && (
                <button
                    type="button"
                    aria-label="Download PDF"
                    onClick={onDownload}
                    className={`${baseBtn} ${enabledBtn}`}
                    title="Download"
                >
                    <Download size={16} />
                </button>
            )}

            {/* Search */}
            {onSearch && (
                <button
                    type="button"
                    aria-label="Search document"
                    onClick={onSearch}
                    className={`${baseBtn} ${enabledBtn}`}
                    title="Search"
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
