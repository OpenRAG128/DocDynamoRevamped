import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';

const DocxPreview = ({ file, zoom }) => {
    const [htmlContent, setHtmlContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const renderDocx = async () => {
            try {
                setLoading(true);
                const arrayBuffer = await file.data.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setHtmlContent(result.value);
            } catch (err) {
                console.error('Error parsing DOCX:', err);
                setError('Failed to render the document. It might be corrupted or in an unsupported format.');
            } finally {
                setLoading(false);
            }
        };

        if (file && file.data) {
            renderDocx();
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
            className="docx-preview-container overflow-auto w-full h-full bg-white text-black p-8 rounded shadow-inner"
            style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-in-out',
            }}
        >
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose max-w-none" />
        </div>
    );
};

export default DocxPreview;