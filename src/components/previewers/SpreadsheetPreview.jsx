import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const SpreadsheetPreview = ({ file, zoom, darkMode }) => {
    const [sheets, setSheets] = useState([]);
    const [activeSheet, setActiveSheet] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const parseFile = async () => {
            try {
                setLoading(true);
                const extension = file.name.split('.').pop().toLowerCase();

                if (extension === 'csv') {
                    const text = await file.data.text();
                    Papa.parse(text, {
                        complete: (results) => {
                            setSheets([{ name: 'Data', data: results.data }]);
                            setLoading(false);
                        },
                        error: (err) => {
                            setError(err.message);
                            setLoading(false);
                        }
                    });
                } else if (extension === 'xlsx') {
                    const arrayBuffer = await file.data.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                    const parsedSheets = workbook.SheetNames.map(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        return { name: sheetName, data };
                    });

                    setSheets(parsedSheets);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error parsing Spreadsheet:', err);
                setError('Failed to render the spreadsheet. It might be corrupted.');
                setLoading(false);
            }
        };

        if (file && file.data) {
            parseFile();
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

    const currentSheetData = sheets[activeSheet]?.data || [];

    return (
        <div className={`flex flex-col h-full w-full ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            {/* Tab Header for multiple sheets */}
            {sheets.length > 1 && (
                <div className={`flex overflow-x-auto border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    {sheets.map((sheet, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSheet(index)}
                            className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${activeSheet === index
                                ? (darkMode ? 'border-b-2 border-indigo-400 text-indigo-400' : 'border-b-2 border-indigo-600 text-indigo-600')
                                : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')}`}
                        >
                            {sheet.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-4">
                <div
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top left',
                        transition: 'transform 0.2s ease-in-out',
                    }}
                >
                    <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <tbody className={`${darkMode ? 'bg-gray-900 divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}`}>
                            {currentSheetData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className={`px-3 py-2 whitespace-nowrap text-sm ${rowIndex === 0 ? 'font-semibold' : ''} ${darkMode ? 'text-gray-300' : 'text-gray-700'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                        >
                                            {cell !== undefined && cell !== null ? String(cell) : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SpreadsheetPreview;