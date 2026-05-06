import React from 'react';
import { Download, FileWarning } from 'lucide-react';

const UnsupportedFileFallback = ({ file, darkMode }) => {
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
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className={`flex flex-col items-center justify-center h-full w-full p-8 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <div className={`flex flex-col items-center p-8 rounded-2xl max-w-md w-full border ${darkMode ? 'bg-gray-800 border-gray-700 shadow-xl shadow-black/20' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50'}`}>
                <div className={`p-4 rounded-full mb-6 ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-500'}`}>
                    <FileWarning size={48} />
                </div>

                <h3 className="text-xl font-bold text-center mb-2">
                    Preview Not Available
                </h3>

                <p className={`text-center mb-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    This file format cannot be securely rendered in the browser. You can download the file to view it on your device.
                </p>

                <div className={`w-full rounded-lg p-4 mb-6 text-sm ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex justify-between mb-2">
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>File Name</span>
                        <span className="font-medium truncate ml-4" title={file?.name}>{file?.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>File Size</span>
                        <span className="font-medium">{formatBytes(file?.size)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Format</span>
                        <span className="font-medium uppercase">{file?.name?.split('.').pop() || 'Unknown'}</span>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Download size={20} />
                    Download File
                </button>
            </div>
        </div>
    );
};

export default UnsupportedFileFallback;