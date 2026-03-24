import React from 'react';
import { personas } from '../util/personas';

export default function PromptSuggestions({ darkMode, onSelectPrompt }) {
    return (
        <div className="w-full mt-4 sm:mt-8 animate-fadeIn animation-delay-300">
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-text mb-4 sm:mb-6 px-4 text-center">
                Choose your prompts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-8 px-2 sm:px-4 w-full">
                {personas.map((persona) => (
                    <div
                        key={persona.id}
                        className={`flex flex-col p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300
              ${darkMode
                                ? 'bg-gray-800/80 border border-gray-700 hover:border-accent/40 shadow-lg'
                                : 'bg-white border border-gray-200 hover:border-accent/30 shadow-xl'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className={`p-3 sm:p-4 rounded-full flex-shrink-0 ${darkMode ? 'bg-gray-700 text-accent' : 'bg-blue-50 text-[#3258d5]'}`}>
                                {React.cloneElement(persona.icon, { className: "w-5 h-5 sm:w-7 sm:h-7" })}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-lg sm:text-xl font-display font-bold text-text flex items-center gap-2">
                                    {persona.label}
                                </h4>
                                <p className="text-xs sm:text-sm text-text/60 mt-1">
                                    {persona.description}
                                </p>
                            </div>
                        </div>

                        {/* Prompts list */}
                        <div className="flex flex-col gap-2.5 sm:gap-3 mt-1 sm:mt-2 flex-grow">
                            {persona.prompts.map((prompt, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all
                    ${darkMode
                                            ? 'bg-gray-900/50 border border-gray-700/50'
                                            : 'bg-gray-50 border border-gray-100'
                                        }`}
                                >
                                    <p className="text-sm sm:text-sm text-text font-medium flex-1 text-center sm:text-left">
                                        {prompt}
                                    </p>
                                    <button
                                        onClick={() => onSelectPrompt(prompt, persona.label)}
                                        className="w-full sm:w-auto flex items-center justify-center whitespace-nowrap gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-xs sm:text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-200"
                                    >
                                        Run Prompt <span className="text-sm sm:text-lg leading-none">→</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Create custom prompt link */}
                        <button
                            onClick={() => onSelectPrompt('', persona.label)}
                            className="mt-4 sm:mt-6 text-sm text-accent/80 hover:text-accent font-medium text-center transition-colors flex items-center justify-center gap-1"
                        >
                            + Create a custom prompt
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
