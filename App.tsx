import React, { useState, useRef, useEffect } from 'react';
import { Code, Sparkles, Play, Pause, ChevronRight, Zap, Info, ArrowRight } from 'lucide-react';
import { analyzeCode, generateSpeech } from './services/geminiService';
import { ExplanationResult, LoadingState } from './types';
import { LayerTabs } from './components/LayerTabs';
import { ComplexityMeter } from './components/ComplexityMeter';
import { Visualizer } from './components/Visualizer';
import { QuizView } from './components/QuizView';

const SAMPLE_CODE = `
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
`;

function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [activeTab, setActiveTab] = useState<'layman' | 'structural' | 'visual' | 'quiz'>('layman');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    
    setLoadingState('analyzing');
    setResult(null); // Clear previous result
    setActiveTab('layman');
    
    try {
      const data = await analyzeCode(code);
      setResult(data);
      setLoadingState('complete');
    } catch (error) {
      console.error(error);
      setLoadingState('error');
    }
  };

  const handleTTS = async () => {
    if (!result) return;
    
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      // Build a readable script
      const script = `Here is the vibe check for your ${result.domain} code. 
      Analogy: ${result.layman.analogy}. 
      Basically: ${result.layman.description}. 
      Key Takeaway: ${result.layman.keyTakeaway}`;

      const audioData = await generateSpeech(script);
      
      // Setup Audio Context
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], 
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlayingAudio(true);
        audioRef.current.onended = () => setIsPlayingAudio(false);
      }
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row overflow-hidden">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />

      {/* LEFT PANEL: Input */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col h-screen overflow-y-auto border-r border-zinc-800">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
              <Code className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">VibeCode</h1>
              <p className="text-xs text-zinc-500 font-mono">CODE EXPLAINER v1.0</p>
            </div>
          </div>
          <div className="hidden sm:block">
             <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-500">Powered by Gemini 2.5</span>
          </div>
        </header>

        <div className="flex-1 flex flex-col relative group">
          <div className="absolute top-0 right-0 p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Paste Code Here</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-[#0d0d10] text-sm font-mono text-zinc-300 p-6 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 border border-zinc-800 transition-all placeholder:text-zinc-700"
            placeholder="// Paste your complex code here..."
            spellCheck={false}
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-zinc-500 hidden sm:block">
                Supported: Python, JS, C++, Rust, Go...
            </div>
            <button
                onClick={handleAnalyze}
                disabled={loadingState === 'analyzing' || !code.trim()}
                className={`
                group relative px-8 py-4 bg-white text-black font-bold rounded-xl 
                flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]
                `}
            >
                {loadingState === 'analyzing' ? (
                <>
                    <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Vibes...</span>
                </>
                ) : (
                <>
                    <Sparkles size={18} className="text-purple-600 group-hover:rotate-12 transition-transform" />
                    <span>Explain It</span>
                    <ArrowRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                </>
                )}
            </button>
        </div>
      </div>

      {/* RIGHT PANEL: Output */}
      <div className="w-full lg:w-1/2 bg-zinc-950/50 p-6 h-screen overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />
        
        {!result && loadingState === 'idle' && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 animate-float">
                <Zap size={32} className="text-zinc-700" />
            </div>
            <p className="font-light">Ready to deconstruct your logic.</p>
          </div>
        )}

        {loadingState === 'error' && (
          <div className="h-full flex flex-col items-center justify-center text-red-400">
             <Info size={32} className="mb-4" />
             <p>Analysis failed. Try again or check your API Key.</p>
          </div>
        )}

        {result && (
          <div className="max-w-2xl mx-auto pb-20 animate-fadeIn">
            {/* Header Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Domain Detected</span>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                  {result.domain}
                </h2>
              </div>
              <ComplexityMeter score={result.complexityScore} />
            </div>

            {/* Navigation */}
            <LayerTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content Area */}
            <div className="min-h-[400px]">
              {activeTab === 'layman' && (
                <div className="space-y-6">
                  <div className="glass-panel p-8 rounded-3xl border-t border-purple-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Sparkles size={100} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center">
                            The Analogy
                            <button 
                                onClick={handleTTS}
                                className="ml-3 p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors"
                                title="Listen to explanation"
                            >
                                {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                        </h3>
                        <p className="text-xl leading-relaxed font-light text-zinc-100">
                            "{result.layman.analogy}"
                        </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                        <h4 className="text-sm font-bold text-zinc-500 uppercase mb-3">In Plain English</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm">{result.layman.description}</p>
                    </div>
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-900 p-6 rounded-2xl border border-zinc-800">
                        <h4 className="text-sm font-bold text-zinc-500 uppercase mb-3">Key Takeaway</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm font-medium">{result.layman.keyTakeaway}</p>
                    </div>
                  </div>
                  
                   {/* Suggestion Box */}
                   <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                        <Info className="text-blue-400 shrink-0 mt-1" size={18} />
                        <div>
                            <h4 className="text-blue-400 font-bold text-sm mb-1">Learning Path</h4>
                            <p className="text-blue-200/70 text-sm">{result.suggestion}</p>
                        </div>
                   </div>
                </div>
              )}

              {activeTab === 'structural' && (
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-blue-400 mb-4">Core Components</h3>
                    <div className="space-y-3">
                        {result.structural.components.map((comp, i) => (
                            <div key={i} className="flex items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                                <div className="bg-blue-500/20 text-blue-400 p-1.5 rounded mr-3 mt-0.5">
                                    <Code size={14} />
                                </div>
                                <div>
                                    <span className="block text-white font-mono text-sm font-bold">{comp.name}</span>
                                    <span className="text-zinc-500 text-sm">{comp.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4">
                     <h3 className="text-lg font-bold text-zinc-300 ml-1">Execution Flow</h3>
                     {result.structural.flowSteps.map((step, i) => (
                         <div key={i} className="flex items-center group">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-500 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                                {i + 1}
                            </div>
                            <div className="mx-4 h-[1px] flex-1 bg-zinc-800 group-hover:bg-blue-500/30 transition-colors"></div>
                            <div className="w-4/5 bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-sm text-zinc-300 group-hover:text-white transition-colors">
                                {step}
                            </div>
                         </div>
                     ))}
                  </div>
                  
                  <div className="bg-zinc-900 p-4 rounded-xl border-l-4 border-yellow-500">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Dependencies & Libraries</h4>
                    <div className="flex flex-wrap gap-2">
                        {result.structural.dependencies.length > 0 ? (
                            result.structural.dependencies.map((dep, i) => (
                                <span key={i} className="px-2 py-1 bg-black rounded border border-zinc-800 text-xs text-yellow-500 font-mono">
                                    {dep}
                                </span>
                            ))
                        ) : (
                            <span className="text-zinc-600 text-sm italic">Standard Library Only</span>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visual' && (
                <Visualizer 
                    mermaidCode={result.visual.mermaidCode}
                    asciiArt={result.visual.nanoBananaAscii}
                    description={result.visual.explanation}
                />
              )}

              {activeTab === 'quiz' && (
                <QuizView questions={result.quiz} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
