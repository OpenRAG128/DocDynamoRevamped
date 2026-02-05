import {
    GraduationCap,
    FlaskConical,
    Briefcase,
    Quote,
    FolderOpen,
    UserCog,
    FileText,
    Sparkles
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, children, darkMode }) => {
    return (
        <div
            className={`group relative flex flex-col p-6 rounded-2xl transition-all duration-300 h-full
        ${darkMode
                    ? 'bg-gray-900/60 border border-gray-700 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(103,80,246,0.15)]'
                    : 'bg-white border border-gray-200 hover:border-accent/30 hover:shadow-xl'
                }`}
        >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
        ${darkMode
                    ? 'bg-accent/20 text-accent group-hover:bg-accent/30'
                    : 'bg-accent/10 text-accent group-hover:bg-accent/20'
                }`}
            >
                <Icon size={24} />
            </div>

            {/* Title */}
            <h3 className="font-display text-xl font-bold text-text mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-text/60 mb-4 leading-relaxed">
                {description}
            </p>

            {/* Visual Content */}
            <div className="flex-1 flex items-end">
                {children}
            </div>
        </div>
    );
};

// Mini mockup components for visual interest
const ResearcherMockup = ({ darkMode }) => (
    <div className={`w-full rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`px-3 py-2 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-2">
                <FileText size={14} className="text-accent" />
                <span className="text-xs text-text/70 truncate">research_paper.pdf</span>
            </div>
        </div>
        <div className="p-3 space-y-2">
            <div className={`h-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} w-full`}></div>
            <div className={`h-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} w-4/5`}></div>
            <div className={`h-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} w-3/4`}></div>
        </div>
        <div className={`px-3 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3258d5]/10 to-accent/10 text-xs text-text/60">
                    Ask any question...
                </div>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                </div>
            </div>
        </div>
    </div>
);

const StudentMockup = ({ darkMode }) => (
    <div className={`w-full rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`px-3 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
                <FileText size={12} className="text-accent" />
                <span className="text-xs text-text/70">lecture_notes.pdf</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">Study Mode</span>
        </div>
        <div className="p-3 space-y-2">
            <div className={`px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <span className="text-text/70">Summarize Chapter 3 in bullet points</span>
            </div>
            <div className={`px-3 py-2 rounded-xl bg-gradient-to-r from-[#3258d5]/10 to-accent/10 border ${darkMode ? 'border-accent/30' : 'border-accent/20'}`}>
                <ul className="text-xs text-text/80 space-y-1.5">
                    <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>Key concept: Neural plasticity</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>Learning occurs through...</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>Memory consolidation requires...</span>
                    </li>
                </ul>
            </div>
            <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-[10px] font-medium">
                    Quiz Me
                </button>
                <button className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-medium ${darkMode ? 'bg-gray-700 text-text/70' : 'bg-white border border-gray-200 text-text/70'}`}>
                    Flashcards
                </button>
            </div>
        </div>
    </div>
);

const ProfessionalMockup = ({ darkMode }) => (
    <div className={`w-full rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`px-3 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2`}>
            <FileText size={12} className="text-red-500" />
            <span className="text-xs text-text/70">financial_report.pdf</span>
        </div>
        <div className="p-3 space-y-2">
            <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-accent">78.19%</div>
                <div className="flex-1 h-6 rounded bg-gradient-to-r from-accent/20 to-accent/40 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-[#3258d5] to-accent rounded"></div>
                </div>
            </div>
            <div className="flex gap-1">
                {[40, 60, 45, 80, 55, 70].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end h-12">
                        <div
                            className={`rounded-t transition-all ${i === 3 ? 'bg-accent' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                            style={{ height: `${h}%` }}
                        ></div>
                    </div>
                ))}
            </div>
        </div>
        <div className={`mx-3 mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-[#3258d5] to-accent text-white text-xs text-center`}>
            What's the Q2 net profit?
        </div>
    </div>
);

const CitationMockup = ({ darkMode }) => (
    <div className="w-full space-y-2">
        <div className={`px-3 py-2 rounded-lg text-xs text-right ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <span className="text-text/70">Who is the author of this paper?</span>
        </div>
        <div className={`px-3 py-2 rounded-xl bg-gradient-to-r from-[#3258d5]/10 to-accent/10 border ${darkMode ? 'border-accent/30' : 'border-accent/20'}`}>
            <p className="text-xs text-text/80 leading-relaxed">
                The author is <span className="font-medium text-accent">Dr. Jane Smith</span> from MIT, as stated on
                <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-medium">
                    Page 1
                </span>
            </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-text/60">Jump to source</span>
        </div>
    </div>
);

const MultiFileMockup = ({ darkMode }) => (
    <div className={`w-full rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`px-3 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text/70">Uploaded Files</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">3/5</span>
            </div>
        </div>
        <div className="p-3 space-y-1.5">
            {[
                { name: 'thesis_draft.pdf', pages: '24 pages' },
                { name: 'research_data.pdf', pages: '12 pages' },
                { name: 'references.pdf', pages: '8 pages' },
            ].map((file, i) => (
                <div key={file.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
                    <div className="w-5 h-5 rounded bg-gradient-to-r from-[#3258d5]/20 to-accent/20 flex items-center justify-center">
                        <FileText size={10} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-text/80 truncate">{file.name}</p>
                        <p className="text-[10px] text-text/40">{file.pages}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>
            ))}
        </div>
        <div className={`px-3 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <span className="text-[10px] text-text/50">+ Add more files (2 remaining)</span>
            </div>
        </div>
    </div>
);

const LanguageMockup = ({ darkMode }) => (
    <div className={`w-full rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`px-3 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span className="text-xs font-medium text-text/70">Choose Your Role</span>
        </div>
        <div className="p-3 grid grid-cols-3 gap-1.5">
            {[
                { icon: '🎓', role: 'Student', active: true },
                { icon: '🔬', role: 'Researcher' },
                { icon: '💼', role: 'Professional' },
                { icon: '👨‍🏫', role: 'Teacher' },
                { icon: '📋', role: 'PM' },
                { icon: '🚀', role: 'Founder' },
            ].map(({ icon, role, active }) => (
                <div
                    key={role}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] transition-all cursor-pointer
                        ${active
                            ? 'bg-gradient-to-r from-[#3258d5]/20 to-accent/20 border border-accent/30'
                            : darkMode
                                ? 'bg-gray-700/50 hover:bg-gray-700'
                                : 'bg-white border border-gray-200 hover:border-accent/30'
                        }`}
                >
                    <span className="text-base">{icon}</span>
                    <span className={active ? 'text-accent font-medium' : 'text-text/60'}>{role}</span>
                </div>
            ))}
        </div>
        <div className={`px-3 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className="text-[10px] text-text/50 text-center">Responses tailored to your expertise level</p>
        </div>
    </div>
);

export default function FeaturesSection({ darkMode }) {
    const features = [
        {
            icon: FlaskConical,
            title: "Research Smarter",
            description: "Dive deep into academic papers and journals. Extract key findings, compare methodologies, and build your literature review faster.",
            mockup: ResearcherMockup
        },
        {
            icon: GraduationCap,
            title: "Ace Your Studies",
            description: "Transform lecture notes into study guides. Quiz yourself, clarify confusing concepts, and prep for exams with confidence.",
            mockup: StudentMockup
        },
        {
            icon: Briefcase,
            title: "Work Efficiently",
            description: "Cut through lengthy contracts, reports, and manuals. Get straight to the information that matters for your decisions.",
            mockup: ProfessionalMockup
        },
        {
            icon: Quote,
            title: "Traceable Answers",
            description: "Every response links back to the exact source. Verify facts instantly without scrolling through pages.",
            mockup: CitationMockup
        },
        {
            icon: FolderOpen,
            title: "Chat Across Files",
            description: "Upload up to 5 documents and chat with all of them at once. Cross-reference and compare insights seamlessly.",
            mockup: MultiFileMockup
        },
        {
            icon: UserCog,
            title: "Role-Based Answers",
            description: "Select your role and get responses tailored to your expertise. From student-friendly explanations to expert-level analysis.",
            mockup: LanguageMockup
        }
    ];

    return (
        <section className="w-full py-12 sm:py-16">
            {/* Section Header */}
            <div className="text-center mb-10 sm:mb-14">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-text mb-3">
                    Why{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3258d5] to-accent">
                        DocDynamo
                    </span>
                    ?
                </h2>
                <p className="text-text/60 text-base sm:text-lg max-w-2xl mx-auto px-4">
                    Turn static documents into dynamic conversations. Upload, ask, and discover insights in seconds.
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {features.map((feature) => (
                    <FeatureCard
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        darkMode={darkMode}
                    >
                        <feature.mockup darkMode={darkMode} />
                    </FeatureCard>
                ))}
            </div>
        </section>
    );
}
