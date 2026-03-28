import React from 'react';
import { personas } from '../util/personas';

export default function PromptSuggestions({ darkMode, onSelectPrompt, selectedRole }) {
    const activePersona = personas.find(p => p.label === selectedRole) || personas[0];

    return (
        <div className="w-full mt-4 sm:mt-8 animate-fadeIn animation-delay-300">
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-text mb-4 sm:mb-6 px-4 text-center">
                Try these prompts as {activePersona.label}
            </h3>

            <div className="flex justify-center px-2 sm:px-4 w-full">
                <div className={`w-full max-w-3xl flex flex-col p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border border-gray-700 shadow-lg' : 'bg-white border border-gray-200 shadow-xl'}`}>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-full flex-shrink-0 ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-[#3258d5]'}`}>
                            {React.cloneElement(activePersona.icon, { className: "w-6 h-6 sm:w-8 sm:h-8" })}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-lg sm:text-xl font-display font-bold text-text">
                                {activePersona.label}
                            </h4>
                            <p className="text-sm sm:text-base text-text/60 mt-1">
                                {activePersona.description}
                            </p>
                        </div>
                    </div>

                    {/* Prompts list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {activePersona.prompts.map((prompt, index) => (
                            <div
                                key={index}
                                className={`flex flex-col justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-100'}`}
                            >
                                <p className="text-sm text-text font-medium text-left mb-2">
                                    "{prompt}"
                                </p>
                                <button
                                    onClick={() => onSelectPrompt(prompt, activePersona.label)}
                                    className="w-full flex items-center justify-center whitespace-nowrap gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-xs sm:text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-200"
                                >
                                    Run Prompt <span className="text-sm sm:text-lg leading-none">→</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
