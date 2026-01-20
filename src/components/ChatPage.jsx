import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, SendHorizontalIcon } from 'lucide-react';

export default function ChatPage({ darkMode }) {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        try {
            const savedChats = JSON.parse(localStorage.getItem('docDynamoChats') || '[]');
            const found = savedChats.find((c) => c.id === chatId);
            setChat(found || null);

            if (found) {
                setMessages([
                    { id: 'user-initial', role: 'user', text: found.message },
                    {
                        id: 'assistant-welcome',
                        role: 'assistant',
                        text:
                            'This is a preview chat layout. In a full version, AI answers and document-grounded insights would appear here.',
                    },
                ]);
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }, [chatId]);

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
                className={`flex flex-col flex-[1.2] border-r ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-inherit/60">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className={`p-1.5 rounded-md cursor-pointer ${darkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text/60">Document</span>
                            <span className="text-sm font-semibold truncate max-w-xs text-text">{chat.files?.[0] || 'Uploaded file'}</span>
                        </div>
                    </div>
                    <span className="text-xs text-text/50 hidden sm:inline">Preview only</span>
                </div>

                {/* Fake document viewer */}
                <div className="flex-1 overflow-hidden p-4">
                    <div
                        className={`h-full w-full rounded-xl border text-xs sm:text-sm flex flex-col gap-3 p-4 ${darkMode ? 'border-gray-700 bg-gray-900 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                                <FileText size={16} className="text-accent" />
                                <span className="truncate max-w-[200px] sm:max-w-[320px]">{chat.files?.[0] || 'Your document'}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-text/40">Static preview</span>
                        </div>

                        <div className="flex-1 rounded-lg border border-dashed border-current/15 bg-gradient-to-br from-background to-transparent flex items-center justify-center">
                            <p className="max-w-xs text-center leading-relaxed text-text/60">
                                A full version of DocDynamo would render your PDF or document here so
                                you can scroll while chatting.
                            </p>
                        </div>
                    </div>
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
