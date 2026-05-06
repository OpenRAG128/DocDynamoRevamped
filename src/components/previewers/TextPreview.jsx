import React, { useState, useEffect } from 'react';

const TextPreview = ({ file, zoom }) => {
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const readText = async () => {
            try {
                setLoading(true);
                const text = await file.data.text();
                setContent(text);
            } catch (err) {
                console.error('Error parsing Text:', err);
                setError('Failed to read the text file.');
            } finally {
                setLoading(false);
            }
        };

        if (file && file.data) {
            readText();
        }
    }, [file]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full w-full text-red-500 p-4 text-center">
                {error}
            </div>
        );
    }

    return (
        <div
            className="text-preview-container overflow-auto w-full h-full bg-white text-black p-8 rounded shadow-inner whitespace-pre-wrap font-mono text-sm"
            style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease-in-out',
            }}
        >
            {content}
        </div>
    );
};

export default TextPreview;