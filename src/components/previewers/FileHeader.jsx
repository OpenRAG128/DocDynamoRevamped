import React from 'react';
import { Download, File, FileText, FileType, FileSpreadsheet, FileWarning } from 'lucide-react';

const FileHeader = ({ file, darkMode }) => {
    if (!file) return null;

    const handleDownload = () => {
        if (!file || !file.data) return;
        const url = URL.createObjectURL(file.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const extension = file.name?.split('.').pop().toLowerCase();

    const getIcon = () => {
        switch (extension) {
            case 'pdf': return <FileText size={18} className="text-red-500" />;
            case 'docx':
            case 'doc': return <FileType size={18} className="text-blue-500" />;
            case 'csv':
            case 'xlsx': return <FileSpreadsheet size={18} className="text-green-500" />;
            case 'txt': return <File size={18} className="text-gray-500" />;
            default: return <FileWarning size={18} className="text-orange-500" />;
        }
    };

    return (
        <div className={`p-2 w-full border-b flex justify-between items-center ${darkMode ? 'bg-[#18181b] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-1.5 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                    {getIcon()}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} title={file.name}>
                        {file.name}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatBytes(file.size)} • {extension?.toUpperCase()}
                    </span>
                </div>
            </div>
            <button
                onClick={handleDownload}
                className={`p-1.5 rounded hover:bg-black/5 hover:dark:bg-white/10 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                title="Download File"
            >
                <Download size={18} />
            </button>
        </div>
    );
};

export default FileHeader;