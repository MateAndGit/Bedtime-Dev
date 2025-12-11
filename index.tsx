import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { Moon, BookOpen, Calendar, RefreshCw, ChevronRight, Code, Sparkles, Coffee, Play, ExternalLink, Languages, HelpCircle, CheckCircle, XCircle, Volume2, CloudMoon } from 'lucide-react';

declare global {
  interface Window {
    Prism: any;
  }
}

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Types ---

interface BilingualText {
  en: string;
  kr: string;
}

interface DailyContent {
  word: string;
  pronunciation: string;
  definition: BilingualText;
  exampleSentence: BilingualText;
  devContext: BilingualText;
  devTipTitle: BilingualText;
  devTipContent: BilingualText;
  codeSnippet?: string;
}

interface StudyDay {
  day: string;
  topic: BilingualText;
  englishFocus: BilingualText;
  devFocus: BilingualText;
  duration: string;
}

interface WeeklyPlan {
  goal: BilingualText;
  schedule: StudyDay[];
}

interface WatchContent {
  text: string;
  sources: Array<{
    uri: string;
    title: string;
  }>;
}

interface QuizContent {
  question: BilingualText;
  codeSnippet?: string;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
}

interface StoryContent {
  title: BilingualText;
  story: string;
  summary: string;
}

// --- Helper Functions ---

const speak = (text: string) => {
  if (!window.speechSynthesis) return;
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // Slightly slower for study
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

// --- Components ---

const CodeBlock = ({ code }: { code: string }) => {
  useEffect(() => {
    if (window.Prism) {
      window.Prism.highlightAll();
    }
  }, [code]);

  return (
    <div className="mt-8 rounded-2xl overflow-hidden bg-[#2d2d2d] border border-night-800 shadow-xl">
       <div className="flex items-center justify-between px-4 py-3 bg-night-900/80 border-b border-night-800">
         <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
         </div>
         <span className="text-xs font-mono text-night-muted font-medium">Java</span>
       </div>
       <div className="p-6 md:p-8 overflow-x-auto">
          <pre className="font-mono text-sm md:text-base leading-loose min-w-max"><code className="language-java">{code}</code></pre>
       </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="w-full animate-pulse space-y-6">
    <div className="h-12 bg-night-800 rounded-lg w-1/3"></div>
    <div className="h-48 bg-night-800 rounded-2xl w-full"></div>
    <div className="h-12 bg-night-800 rounded-lg w-1/4"></div>
    <div className="h-32 bg-night-800 rounded-2xl w-full"></div>
  </div>
);

const DailyCard = ({ content, loading, showTranslation, onRefresh }: { content: DailyContent | null, loading: boolean, showTranslation: boolean, onRefresh: () => void }) => {
  if (loading) return <div className="max-w-3xl mx-auto"><LoadingSkeleton /></div>;
  if (!content) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-3xl mx-auto">
      {/* English Section */}
      <div className="bg-night-800/40 border border-night-700/50 rounded-3xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
        <div className="flex items-start justify-between mb-8">
          <div className="min-w-0 flex-1 pr-4">
            <span className="text-night-highlight text-sm font-mono uppercase tracking-widest font-semibold">Word of the Night</span>
            <div className="flex items-center gap-3 mt-3 min-w-0">
              <h2 className="text-4xl md:text-5xl font-serif text-white font-medium tracking-tight break-words min-w-0">{content.word}</h2>
              <button 
                onClick={(e) => { e.stopPropagation(); speak(content.word); }}
                className="p-2 rounded-full bg-night-800 hover:bg-night-700 text-night-accent transition-colors flex-shrink-0"
                aria-label="Listen to pronunciation"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            <p className="text-night-muted font-mono text-lg mt-2">{content.pronunciation}</p>
          </div>
          <div className="bg-night-900/50 p-3 rounded-full flex-shrink-0">
            <BookOpen className="text-night-highlight w-8 h-8" />
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-xl md:text-2xl text-night-text leading-relaxed font-light break-words">
            {showTranslation ? content.definition.kr : content.definition.en}
          </p>
        </div>

        <div className="bg-night-900/30 rounded-2xl p-6 border-l-4 border-night-highlight mb-8 relative group">
          <button 
            onClick={() => speak(content.exampleSentence.en)}
            className="absolute top-4 right-4 p-2 rounded-full bg-night-800/50 hover:bg-night-700 text-night-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Listen to example"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <p className="text-lg text-night-muted italic leading-relaxed font-serif pr-8 break-words">
            "{showTranslation ? content.exampleSentence.kr : content.exampleSentence.en}"
          </p>
        </div>

        <div className="pt-6 border-t border-night-700/50">
           <h3 className="text-base font-semibold text-night-accent mb-3 uppercase tracking-wide">Dev Context</h3>
           <p className="text-lg text-night-text leading-relaxed break-words">
             {showTranslation ? content.devContext.kr : content.devContext.en}
           </p>
        </div>
      </div>

      {/* Dev Tip Section */}
      <div className="bg-night-800/40 border border-night-700/50 rounded-3xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-night-900/50 p-3 rounded-xl flex-shrink-0">
             <Code className="w-6 h-6 text-night-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white break-words min-w-0">
            {showTranslation ? content.devTipTitle.kr : content.devTipTitle.en}
          </h2>
        </div>
        
        <p className="text-lg md:text-xl text-night-text mb-8 leading-loose text-gray-300 break-words">
          {showTranslation ? content.devTipContent.kr : content.devTipContent.en}
        </p>

        {content.codeSnippet && <CodeBlock code={content.codeSnippet} />}
      </div>

      <button 
        onClick={onRefresh}
        className="w-full py-6 flex items-center justify-center gap-3 text-night-muted hover:text-white transition-colors text-lg font-medium group"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>Load new knowledge</span>
      </button>
    </div>
  );
};

const QuizCard = ({ content, loading, showTranslation, onGenerate }: { content: QuizContent | null, loading: boolean, showTranslation: boolean, onGenerate: () => void }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsRevealed(false);
  }, [content]);

  const handleOptionClick = (index: number) => {
    if (isRevealed) return;
    setSelectedOption(index);
    setIsRevealed(true);
  };

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingSkeleton /></div>;
  
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-8 animate-fade-in max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-night-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-night-700">
          <HelpCircle className="w-12 h-12 text-night-accent" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">Sleepy Quiz</h2>
          <p className="text-xl text-night-muted max-w-lg mx-auto leading-relaxed">
            Test your Java knowledge with a quick nightly question to refresh your memory.
          </p>
        </div>
        <button 
          onClick={onGenerate}
          className="bg-night-accent hover:bg-indigo-400 text-night-900 font-bold text-lg py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-3xl mx-auto">
      <div className="bg-night-800/40 border border-night-700/50 rounded-3xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
           <HelpCircle className="w-6 h-6 text-night-highlight flex-shrink-0" />
           <span className="text-night-highlight text-sm font-mono uppercase tracking-widest font-semibold">Daily Challenge</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-medium text-white mb-8 leading-snug break-words">
          {showTranslation ? content.question.kr : content.question.en}
        </h3>

        {content.codeSnippet && <CodeBlock code={content.codeSnippet} />}

        <div className="space-y-4">
          {content.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === content.correctIndex;
            
            let buttonStyle = "bg-night-900/40 border-night-700 hover:bg-night-800 hover:border-night-600";
            let icon = null;

            if (isRevealed) {
              if (isCorrect) {
                buttonStyle = "bg-green-900/20 border-green-500/50 text-green-100 ring-1 ring-green-500/50";
                icon = <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 ml-2" />;
              } else if (isSelected) {
                buttonStyle = "bg-red-900/20 border-red-500/50 text-red-100 ring-1 ring-red-500/50";
                icon = <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 ml-2" />;
              } else {
                buttonStyle = "opacity-40 border-night-800";
              }
            } else {
               if (isSelected) buttonStyle = "bg-night-700 border-night-500 ring-1 ring-night-500";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isRevealed}
                className={`w-full p-6 md:p-8 rounded-2xl border flex items-center justify-between transition-all text-left group ${buttonStyle}`}
              >
                <span className="text-lg md:text-xl font-medium break-words">
                  {showTranslation ? option.kr : option.en}
                </span>
                {icon}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="mt-10 p-8 bg-night-900/60 rounded-2xl border border-night-700/50 animate-fade-in">
            <h4 className="text-base font-semibold text-night-highlight mb-3 uppercase tracking-wide">Explanation</h4>
            <p className="text-lg text-night-text leading-loose break-words">
              {showTranslation ? content.explanation.kr : content.explanation.en}
            </p>
          </div>
        )}
      </div>

      <button 
        onClick={onGenerate}
        className="w-full py-6 flex items-center justify-center gap-3 text-night-muted hover:text-white transition-colors text-lg font-medium group"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>Try another question</span>
      </button>
    </div>
  );
};

const PlanCard = ({ plan, loading, showTranslation, onGenerate }: { plan: WeeklyPlan | null, loading: boolean, showTranslation: boolean, onGenerate: () => void }) => {
  if (loading) return <div className="max-w-3xl mx-auto"><LoadingSkeleton /></div>;

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-8 animate-fade-in max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-night-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-night-700">
          <Sparkles className="w-12 h-12 text-night-accent" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">No plan generated yet</h2>
          <p className="text-xl text-night-muted max-w-lg mx-auto leading-relaxed">
            Create a personalized weekly schedule mixing technical English vocabulary with Java concepts.
          </p>
        </div>
        <button 
          onClick={onGenerate}
          className="bg-night-accent hover:bg-indigo-400 text-night-900 font-bold text-lg py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
        >
          Generate Study Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-night-800 to-night-900 border border-night-700/50 rounded-3xl p-8 md:p-10 shadow-2xl">
        <h2 className="text-night-highlight text-sm uppercase tracking-widest font-semibold mb-3">Weekly Goal</h2>
        <h3 className="text-2xl md:text-3xl font-semibold text-white leading-tight break-words">
          {showTranslation ? plan.goal.kr : plan.goal.en}
        </h3>
      </div>

      <div className="space-y-4">
        {plan.schedule.map((day, idx) => (
          <div key={idx} className="bg-night-800/20 border border-night-700/30 rounded-2xl p-6 md:p-8 hover:bg-night-800/40 transition-all hover:border-night-600/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
              <span className="font-mono text-night-highlight text-lg font-bold">{day.day}</span>
              <span className="text-sm text-night-muted flex items-center gap-2 bg-night-900/50 px-3 py-1 rounded-full w-fit flex-shrink-0">
                <Coffee className="w-4 h-4" /> {day.duration}
              </span>
            </div>
            <div className="mb-6">
                 <h4 className="text-xl text-white font-medium leading-relaxed break-words">
                   {showTranslation ? day.topic.kr : day.topic.en}
                 </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-night-800/50">
              <div>
                <span className="text-xs text-night-muted uppercase tracking-wider font-semibold block mb-2">English Focus</span>
                <p className="text-base text-gray-300 break-words">
                  {showTranslation ? day.englishFocus.kr : day.englishFocus.en}
                </p>
              </div>
              <div>
                <span className="text-xs text-night-muted uppercase tracking-wider font-semibold block mb-2">Dev Focus</span>
                <p className="text-base text-gray-300 break-words">
                   {showTranslation ? day.devFocus.kr : day.devFocus.en}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onGenerate}
        className="w-full py-6 flex items-center justify-center gap-3 text-night-muted hover:text-white transition-colors text-lg font-medium group"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>Generate new plan</span>
      </button>
    </div>
  );
};

const WatchCard = ({ content, loading, onSearch }: { content: WatchContent | null, loading: boolean, onSearch: () => void }) => {
  if (loading) return <div className="max-w-3xl mx-auto"><LoadingSkeleton /></div>;

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-8 animate-fade-in max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-night-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-night-700">
          <Play className="w-12 h-12 text-night-accent" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">Nightly Watch</h2>
          <p className="text-xl text-night-muted max-w-lg mx-auto leading-relaxed">
            Find a short, relaxing, and educational coding video (Java/OOP) to watch before sleep.
          </p>
        </div>
        <button 
          onClick={onSearch}
          className="bg-night-accent hover:bg-indigo-400 text-night-900 font-bold text-lg py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
        >
          Find Video
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-3xl mx-auto">
      <div className="bg-night-800/40 border border-night-700/50 rounded-3xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
           <Play className="w-6 h-6 text-night-highlight flex-shrink-0" />
           <span className="text-night-highlight text-sm font-mono uppercase tracking-widest font-semibold">Recommended Watch</span>
        </div>
        
        <div className="prose prose-invert prose-lg max-w-none text-night-text leading-loose">
          {content.text.split('\n').map((line, i) => (
             <p key={i} className="mb-4 text-gray-300 break-words">{line}</p>
          ))}
        </div>
      </div>

      {content.sources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-night-muted uppercase tracking-widest ml-1 mb-2">Links & Resources</h3>
          {content.sources.map((source, idx) => (
            <a 
              key={idx} 
              href={source.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-night-800/40 border border-night-700/50 rounded-2xl p-6 hover:border-night-accent hover:bg-night-800/60 transition-all group shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xl font-medium text-night-text group-hover:text-white leading-snug break-words">{source.title}</span>
                <ExternalLink className="w-5 h-5 text-night-muted group-hover:text-night-accent flex-shrink-0 mt-1" />
              </div>
              <div className="mt-2 text-sm text-night-muted truncate font-mono opacity-60">
                {source.uri}
              </div>
            </a>
          ))}
        </div>
      )}

      <button 
        onClick={onSearch}
        className="w-full py-6 flex items-center justify-center gap-3 text-night-muted hover:text-white transition-colors text-lg font-medium group"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>Find another video</span>
      </button>
    </div>
  );
};

const StoryCard = ({ content, loading, onGenerate }: { content: StoryContent | null, loading: boolean, onGenerate: () => void }) => {
  if (loading) return <div className="max-w-3xl mx-auto"><LoadingSkeleton /></div>;

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-8 animate-fade-in max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-night-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-night-700">
          <CloudMoon className="w-12 h-12 text-night-accent" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">Bedtime Code Story</h2>
          <p className="text-xl text-night-muted max-w-lg mx-auto leading-relaxed">
            Listen to a soothing metaphor explaining a complex Java concept to help you drift off while learning.
          </p>
        </div>
        <button 
          onClick={onGenerate}
          className="bg-night-accent hover:bg-indigo-400 text-night-900 font-bold text-lg py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
        >
          Tell me a Story
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-3xl mx-auto">
      <div className="bg-night-800/40 border border-night-700/50 rounded-3xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <CloudMoon className="w-6 h-6 text-night-highlight" />
              <span className="text-night-highlight text-sm font-mono uppercase tracking-widest font-semibold">Code Lullaby</span>
           </div>
           <button 
              onClick={() => speak(content.story)}
              className="p-3 rounded-full bg-night-900/50 hover:bg-night-700 text-night-accent transition-colors flex items-center gap-2 flex-shrink-0"
           >
             <Volume2 className="w-5 h-5" />
             <span className="text-sm font-medium">Read Aloud</span>
           </button>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-8 leading-tight break-words">
          {content.title.en}
        </h2>

        <div className="prose prose-invert prose-lg max-w-none text-night-text leading-loose font-serif">
          {content.story.split('\n').map((paragraph, i) => (
             <p key={i} className="mb-6 text-gray-300 opacity-90 break-words">{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-night-700/30">
          <h3 className="text-sm font-bold text-night-muted uppercase tracking-widest mb-4">Summary (Korean)</h3>
          <p className="text-lg text-night-text leading-relaxed break-words">
            {content.summary}
          </p>
        </div>
      </div>

      <button 
        onClick={onGenerate}
        className="w-full py-6 flex items-center justify-center gap-3 text-night-muted hover:text-white transition-colors text-lg font-medium group"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>Tell another story</span>
      </button>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'quiz' | 'plan' | 'watch' | 'story'>('daily');
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [watchContent, setWatchContent] = useState<WatchContent | null>(null);
  const [quizContent, setQuizContent] = useState<QuizContent | null>(null);
  const [storyContent, setStoryContent] = useState<StoryContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // --- API Calls ---

  const fetchDailyContent = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate one sophisticated English vocabulary word useful for software engineers (e.g. polymorphism, inheritance, encapsulation, abstraction, thread-safety, serialization) and one concise, actionable Java development tip (Core Java, OOP, Streams API, or Spring Boot basics). Provide both English and Korean translations.",
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              definition: { 
                type: Type.OBJECT, 
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } } 
              },
              exampleSentence: { 
                type: Type.OBJECT, 
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } } 
              },
              devContext: { 
                type: Type.OBJECT, 
                description: "How this word is used in a technical software context",
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } } 
              },
              devTipTitle: { 
                type: Type.OBJECT, 
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } } 
              },
              devTipContent: { 
                 type: Type.OBJECT, 
                 properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } } 
              },
              codeSnippet: { type: Type.STRING, description: "Optional short code example for the tip" }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text);
      setDailyContent(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Create a personalized 7-day study plan for a user re-learning Java (Standard Edition, OOP concepts, maybe some Spring Boot) along with Technical English. Provide content in both English and Korean.",
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goal: { 
                type: Type.OBJECT, 
                description: "A summary goal for the week",
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
              },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING, description: "Monday, Tuesday, etc." },
                    topic: { 
                      type: Type.OBJECT,
                      properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
                    },
                    englishFocus: { 
                      type: Type.OBJECT, 
                      description: "Specific vocabulary or grammar point",
                      properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
                    },
                    devFocus: { 
                      type: Type.OBJECT, 
                      description: "Specific coding concept or pattern (Java)",
                      properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
                    },
                    duration: { type: Type.STRING, description: "Estimated time (e.g., 20 mins)" }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setWeeklyPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchContent = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Find a specific, high-quality, and recent YouTube video tutorial (under 15 minutes) about Java Programming (e.g. Modern Java Features, OOP best practices, Java Streams, or Spring Boot basics). Provide a relaxing, short summary primarily in Korean.",
        config: {
          tools: [{ googleSearch: {} }] 
        }
      });

      const text = response.text;
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title);
      const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values()) as Array<{uri: string, title: string}>;

      setWatchContent({ text, sources: uniqueSources });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizContent = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Create a single multiple-choice question about Java Programming (Core Java, OOP, or Syntax). It should be suitable for someone re-learning Java. Include a code snippet if necessary to predict output or behavior.",
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { 
                type: Type.OBJECT,
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
              },
              codeSnippet: { type: Type.STRING, description: "Code to analyze (optional)" },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
                },
                description: "4 possible answers"
              },
              correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              explanation: {
                type: Type.OBJECT,
                description: "Why the answer is correct",
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setQuizContent(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoryContent = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Explain a core Java concept (e.g., Garbage Collection, JVM, Thread Pool, HashMaps) as a soothing bedtime story. Use metaphors (e.g., a diligent cleaner, a busy librarian). The tone should be relaxing and narrative. Provide the story in English and a brief summary in Korean.",
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { 
                type: Type.OBJECT,
                properties: { en: { type: Type.STRING }, kr: { type: Type.STRING } }
              },
              story: { type: Type.STRING, description: "The bedtime story in English" },
              summary: { type: Type.STRING, description: "Summary in Korean" }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setStoryContent(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dailyContent) {
      fetchDailyContent();
    }
  }, []);

  return (
    <div className="min-h-screen bg-night-950 text-night-text font-sans selection:bg-night-accent selection:text-night-900">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-night-950/90 backdrop-blur-md z-50 border-b border-night-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-6 h-6 text-night-accent fill-night-accent/20" />
            <h1 className="font-semibold text-xl tracking-tight text-white">Bedtime Dev</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  showTranslation 
                    ? 'bg-night-accent text-night-950 shadow-lg shadow-indigo-500/20' 
                    : 'bg-night-800 text-night-muted hover:text-white hover:bg-night-700'
                }`}
             >
               <Languages className="w-4 h-4" />
               {showTranslation ? '한국어' : 'English'}
             </button>
             <div className="text-sm font-mono text-night-muted hidden sm:block bg-night-900 px-3 py-1 rounded-md border border-night-800">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-28 px-6 max-w-3xl mx-auto min-h-screen">
        
        {/* Navigation Tabs */}
        <div className="flex p-1.5 bg-night-900/80 rounded-2xl mb-10 border border-night-800 overflow-x-auto shadow-lg sticky top-24 z-40 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all rounded-xl ${
              activeTab === 'daily' 
                ? 'bg-night-800 text-white shadow-md ring-1 ring-night-700' 
                : 'text-night-muted hover:text-night-text hover:bg-night-800/50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Daily</span>
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all rounded-xl ${
              activeTab === 'quiz' 
                ? 'bg-night-800 text-white shadow-md ring-1 ring-night-700' 
                : 'text-night-muted hover:text-night-text hover:bg-night-800/50'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Quiz</span>
          </button>
          <button 
            onClick={() => setActiveTab('plan')}
            className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all rounded-xl ${
              activeTab === 'plan' 
                ? 'bg-night-800 text-white shadow-md ring-1 ring-night-700' 
                : 'text-night-muted hover:text-night-text hover:bg-night-800/50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Plan</span>
          </button>
          <button 
            onClick={() => setActiveTab('watch')}
            className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all rounded-xl ${
              activeTab === 'watch' 
                ? 'bg-night-800 text-white shadow-md ring-1 ring-night-700' 
                : 'text-night-muted hover:text-night-text hover:bg-night-800/50'
            }`}
          >
            <Play className="w-5 h-5" />
            <span className="hidden sm:inline">Watch</span>
          </button>
           <button 
            onClick={() => setActiveTab('story')}
            className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all rounded-xl ${
              activeTab === 'story' 
                ? 'bg-night-800 text-white shadow-md ring-1 ring-night-700' 
                : 'text-night-muted hover:text-night-text hover:bg-night-800/50'
            }`}
          >
            <CloudMoon className="w-5 h-5" />
            <span className="hidden sm:inline">Story</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'daily' ? (
          <DailyCard 
            content={dailyContent} 
            loading={loading && !dailyContent} // Only show skeleton if no content
            showTranslation={showTranslation}
            onRefresh={fetchDailyContent}
          />
        ) : activeTab === 'quiz' ? (
          <QuizCard 
            content={quizContent} 
            loading={loading} 
            showTranslation={showTranslation}
            onGenerate={fetchQuizContent}
          />
        ) : activeTab === 'plan' ? (
          <PlanCard 
            plan={weeklyPlan} 
            loading={loading} 
            showTranslation={showTranslation}
            onGenerate={generatePlan}
          />
        ) : activeTab === 'watch' ? (
          <WatchCard 
            content={watchContent}
            loading={loading}
            onSearch={fetchWatchContent}
          />
        ) : (
          <StoryCard 
            content={storyContent}
            loading={loading}
            onGenerate={fetchStoryContent}
          />
        )}

      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}