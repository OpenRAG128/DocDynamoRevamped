import React, { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Repeat2, Share, Verified } from 'lucide-react'

export default function Card({
    quote = "It's like ChatGPT, but for",
    highlightText = " research papers.",
    authorName = "Rick Grimes, PhD",
    authorHandle = "@SolictingSherrif",
    authorImage = "/avatar.jpg",
    darkMode = false
}) {
    const [displayedText, setDisplayedText] = useState('')
    const [displayedHighlight, setDisplayedHighlight] = useState('')
    const [isTypingQuote, setIsTypingQuote] = useState(true)
    const [showAuthor, setShowAuthor] = useState(false)
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(2847)
    const intervalRef = useRef(null)
    const timeoutRef = useRef(null)

    // Typing effect
    useEffect(() => {
        const typingSpeed = 50
        let currentIndex = 0

        const typeNextCharacter = () => {
            if (currentIndex <= quote.length) {
                setDisplayedText(quote.slice(0, currentIndex))
                if (currentIndex === quote.length) {
                    setIsTypingQuote(false)
                }
            }
            else if (currentIndex <= quote.length + highlightText.length) {
                const highlightIndex = currentIndex - quote.length
                setDisplayedHighlight(highlightText.slice(0, highlightIndex))
            }
            else {
                clearInterval(intervalRef.current)
                timeoutRef.current = setTimeout(() => setShowAuthor(true), 300)
                return
            }
            currentIndex++
        }

        intervalRef.current = setInterval(typeNextCharacter, typingSpeed)

        return () => {
            clearInterval(intervalRef.current)
            clearTimeout(timeoutRef.current)
        }
    }, [quote, highlightText])

    const handleLike = () => {
        setLiked(!liked)
        setLikeCount(prev => liked ? prev - 1 : prev + 1)
    }

    return (
        <div className={`relative w-full max-w-2xl mx-auto rounded-2xl transition-all duration-500 overflow-hidden mt-14
            ${darkMode
                ? 'bg-gray-900/80 border border-gray-700'
                : 'bg-white border border-gray-200 shadow-xl'
            }`}
        >
            {/* Gradient accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#3258d5] via-accent to-[#3258d5]"></div>

            <div className="p-6 sm:p-8">
                {/* Author header - Twitter style */}
                <div className={`flex items-start gap-3 mb-4 transition-all duration-700 ${showAuthor ? 'opacity-100' : 'opacity-40'}`}>
                    <img
                        src={authorImage}
                        alt={authorName}
                        className={`w-12 h-12 rounded-full object-cover ring-2 transition-all duration-300 ${darkMode ? 'ring-gray-700' : 'ring-gray-100'}`}
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%236750f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-weight="bold"%3E' + authorName.charAt(0) + '%3C/text%3E%3C/svg%3E'
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-text truncate">{authorName}</h3>
                            <Verified size={16} className="text-accent fill-accent flex-shrink-0" />
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{authorHandle}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                        Featured
                    </div>
                </div>

                {/* Quote text with typing animation */}
                <div className="mb-6">
                    <p className="text-xl sm:text-2xl font-medium text-text leading-relaxed">
                        <span>"{displayedText}</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3258d5] to-accent font-bold">
                            {displayedHighlight}
                        </span>
                        {(isTypingQuote || displayedHighlight.length < highlightText.length) && (
                            <span className="inline-block w-0.5 h-6 bg-accent ml-0.5 animate-blink"></span>
                        )}
                        {displayedHighlight.length === highlightText.length && <span>"</span>}
                    </p>
                </div>

                {/* Timestamp */}
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    10:42 AM · Jan 15, 2026
                </p>

                {/* Divider */}
                <div className={`border-t mb-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}></div>

                {/* Engagement stats */}
                <div className={`flex items-center gap-6 text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span><strong className="text-text">847</strong> Reposts</span>
                    <span><strong className="text-text">12.4K</strong> Views</span>
                    <span><strong className="text-text">{likeCount.toLocaleString()}</strong> Likes</span>
                </div>

                {/* Divider */}
                <div className={`border-t mb-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}></div>

                {/* Action buttons - Twitter style */}
                <div className="flex items-center justify-around">
                    <button className={`flex items-center gap-2 p-2 rounded-full transition-all hover:bg-blue-500/10 group ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <MessageCircle size={20} className="group-hover:text-blue-500 transition-colors" />
                    </button>
                    <button className={`flex items-center gap-2 p-2 rounded-full transition-all hover:bg-green-500/10 group ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Repeat2 size={20} className="group-hover:text-green-500 transition-colors" />
                    </button>
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 p-2 rounded-full transition-all hover:bg-red-500/10 group`}
                    >
                        <Heart
                            size={20}
                            className={`transition-all ${liked ? 'text-red-500 fill-red-500 scale-110' : darkMode ? 'text-gray-500 group-hover:text-red-500' : 'text-gray-500 group-hover:text-red-500'} cursor-pointer`}
                        />
                    </button>
                    <button className={`flex items-center gap-2 p-2 rounded-full transition-all hover:bg-blue-500/10 group ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Share size={20} className="group-hover:text-blue-500 transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    )
}
