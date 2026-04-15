import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ message, darkMode, setInput }) {
    const isUser = message.role === 'user';
    const isNotFound = !isUser && message.text?.startsWith('NOT_FOUND:');
    let notFoundTopic = '';
    let notFoundSuggestions = [];

    if (isNotFound) {
        const parts = message.text.replace('NOT_FOUND:', '').split('|||');
        notFoundTopic = parts[0];
        notFoundSuggestions = parts.slice(1).filter(Boolean);
    }

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                ? 'bg-purple-600 text-white'
                : darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                }`}>
                {isUser ? (
                    <span className="text-xs font-semibold">You</span>
                ) : (
                    <>
                        <img
                            src="/logo.svg"
                            alt="DocDynamo"
                            className="w-5 h-5"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'block';
                                }
                            }}
                        />
                        <span className="text-xs font-semibold hidden">D</span>
                    </>
                )}
            </div>
            {/* Message content */}
            <div
                className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                    ? 'ml-auto bg-purple-600 text-white'
                    : darkMode
                        ? 'bg-gray-800/80 text-gray-100'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
            >
                {isNotFound ? (
                    <div className="flex flex-col gap-3">
                        <div>
                            <p className="font-semibold mb-1">This doesn't appear to be covered in your document.</p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try asking:</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {notFoundSuggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(suggestion)}
                                    className={`text-left px-3 py-2 text-xs rounded-xl transition-colors border ${darkMode
                                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200'
                                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'
                                        }`}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            a: ({ node, ...props }) => <a className="underline hover:opacity-80 break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                            code: ({ node, inline, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <div className="relative my-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <div className={`flex items-center justify-between px-3 py-1.5 ${isUser ? 'bg-purple-800' : darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-b ${isUser ? 'border-purple-700' : darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <span className={`text-xs font-mono font-medium ${isUser ? 'text-purple-100' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {match[1]}
                                            </span>
                                            <div className="flex gap-2">
                                                {/* Copy button functionality could represent here */}
                                            </div>
                                        </div>
                                        <pre className={`p-3 overflow-x-auto ${isUser ? 'bg-purple-900' : darkMode ? 'bg-gray-950' : 'bg-gray-50'} font-mono text-xs m-0`}>
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    </div>
                                ) : (
                                    <code className={`px-1.5 py-0.5 rounded-md ${isUser ? 'bg-purple-700 text-purple-100 border border-purple-600' : darkMode ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-gray-100 text-gray-800 border border-gray-200'} font-mono text-xs`} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 border border-gray-200 dark:border-gray-700" {...props} /></div>,
                            thead: ({ node, ...props }) => <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'} {...props} />,
                            th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b dark:border-gray-700" {...props} />,
                            td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm border-b dark:border-gray-700" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}
