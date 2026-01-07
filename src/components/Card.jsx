import React, { useState, useEffect, useRef } from 'react'
import { Heart, ThumbsUp } from 'lucide-react'

export default function Card({
    quote = "It's like ChatGPT, but for",
    highlightText = " research papers.",
    authorName = "Mushtaq Bilal, PhD",
    authorHandle = "@MushtaqBilalPhD",
    authorImage = "/avatar.jpg",
    darkMode = false
}) {
    const [displayedText, setDisplayedText] = useState('')
    const [displayedHighlight, setDisplayedHighlight] = useState('')
    const [isTypingQuote, setIsTypingQuote] = useState(true)
    const [showAuthor, setShowAuthor] = useState(false)
    const intervalRef = useRef(null)
    const timeoutRef = useRef(null)

    // Typing effect
    useEffect(() => {
        const typingSpeed = 50
        let currentIndex = 0

        const typeNextCharacter = () => {
            // Type the quote
            if (currentIndex <= quote.length) {
                setDisplayedText(quote.slice(0, currentIndex))
                if (currentIndex === quote.length) {
                    setIsTypingQuote(false)
                }
            }
            // Type the highlight
            else if (currentIndex <= quote.length + highlightText.length) {
                const highlightIndex = currentIndex - quote.length
                setDisplayedHighlight(highlightText.slice(0, highlightIndex))
            }
            // Typing complete
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

    return (
        <div className={`relative w-full max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl transition-all duration-500 ${darkMode
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700'
            : 'bg-gradient-to-br from-purple-50/80 to-blue-50/80 border border-purple-200'
            }`}>
            {/* Decorative emojis */}
            <div className="absolute top-6 left-6 text-4xl animate-float">
                <Heart className="text-red-500 fill-red-500" size={32} />
            </div>
            <div className="absolute top-6 right-6 text-4xl animate-float animation-delay-2000">
                <ThumbsUp className="text-green-500 fill-green-500" size={32} />
            </div>

            {/* Quote text with typing animation */}
            <div className="text-center mb-8">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-text leading-relaxed">
                    <span className="inline-block">"{displayedText}</span>
                    <span className="text-purple-600 dark:text-purple-400 inline-block">
                        {displayedHighlight}
                    </span>
                    {(isTypingQuote || displayedHighlight.length < highlightText.length) && (
                        <span className="inline-block w-0.5 h-8 sm:h-10 bg-text ml-1 animate-blink"></span>
                    )}
                    {displayedHighlight.length === highlightText.length && <span>"</span>}
                </p>
            </div>

            {/* Author info with fade-in animation */}
            <div className={`flex flex-col items-center gap-3 transition-all duration-700 ${showAuthor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <img
                    src={authorImage}
                    alt={authorName}
                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%236750f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-weight="bold"%3E' + authorName.charAt(0) + '%3C/text%3E%3C/svg%3E'
                    }}
                />
                <div className="text-center">
                    <h3 className="text-lg font-bold text-text">{authorName}</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{authorHandle}</p>
                </div>
            </div>
        </div>
    )
}
