
import React, { useState, useRef, useEffect } from 'react';
import { Code, Sparkles, Play, Pause, ChevronRight, Zap, Info, ArrowRight, FolderUp, FileText, Trash2, Layout } from 'lucide-react';
import { analyzeCode, generateSpeech, generateQuiz, regenerateVisuals } from './services/geminiService';
import { ExplanationResult, LoadingState } from './types';
import { LayerTabs } from './components/LayerTabs';
import { ComplexityMeter } from './components/ComplexityMeter';
import { Visualizer } from './components/Visualizer';
import { QuizView } from './components/QuizView';
import { FileExplorer } from './components/FileExplorer';
import { StructuralView } from './components/StructuralView';

const SAMPLE_CODE = `
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
`;

interface ProjectFile {
  path: string;
  content: string;
}

function App() {
  const [editorContent, setEditorContent] = useState(SAMPLE_CODE); // What user sees in text area
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]); // All loaded files
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null); // Currently selected file path
  
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [activeTab, setActiveTab] = useState<'layman' | 'structural' | 'visual' | 'quiz'>('layman');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProjectMode, setIsProjectMode] = useState(false);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);
  const [isRegeneratingVisuals, setIsRegeneratingVisuals] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFullContext = () => {
    let contextToAnalyze = editorContent;
    if (isProjectMode && projectFiles.length > 0) {
        contextToAnalyze = projectFiles.map(f => `\n\n--- FILE: ${f.path} ---\n${f.content}`).join('');
    }
    return contextToAnalyze;
  };

  const handleAnalyze = async () => {
    const contextToAnalyze = getFullContext();
    if (!contextToAnalyze.trim()) return;
    
    setLoadingState('analyzing');
    setResult(null); // Clear previous result
    setActiveTab('layman');
    
    try {
      const data = await analyzeCode(contextToAnalyze);
      setResult(data);
      setLoadingState('complete');
    } catch (error) {
      console.error(error);
      setLoadingState('error');
    }
  };

  const handleRegenerateQuiz = async (count: number) => {
    if (!result) return;
    
    const contextToAnalyze = getFullContext();
    setIsRegeneratingQuiz(true);
    
    try {
        const newQuestions = await generateQuiz(contextToAnalyze, count);
        setResult(prev => prev ? { ...prev, quiz: newQuestions } : null);
    } catch (e) {
        console.error("Failed to regenerate quiz", e);
    } finally {
        setIsRegeneratingQuiz(false);
    }
  };

  const handleRegenerateVisuals = async () => {
    if (!result) return;
    
    const contextToAnalyze = getFullContext();
    setIsRegeneratingVisuals(true);
    
    try {
        const newVisuals = await regenerateVisuals(contextToAnalyze);
        setResult(prev => prev ? { ...prev, visual: newVisuals } : null);
    } catch (e) {
        console.error("Failed to regenerate visuals", e);
    } finally {
        setIsRegeneratingVisuals(false);
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
      const script = `Here is the vibe check for your ${result.domain} ${isProjectMode ? 'project' : 'code'}. 
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

  // Folder Upload Logic
  const handleFolderClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const shouldIgnoreFile = (path: string) => {
    const ignorePatterns = [
      'node_modules', '.git', 'dist', 'build', 'coverage', '.next', 
      'package-lock.json', 'yarn.lock', '.DS_Store', '.env', 
      '.png', '.jpg', '.jpeg', '.svg', '.ico', '.mp4', '.woff', '.woff2'
    ];
    return ignorePatterns.some(pattern => path.includes(pattern));
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoadingState('generating_visuals'); // UI indicator
    
    const newProjectFiles: ProjectFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.webkitRelativePath || file.name;

      if (shouldIgnoreFile(path)) continue;

      try {
        const text = await file.text();
        // Skip binary files
        if (text.includes('\0')) continue;
        newProjectFiles.push({ path, content: text });
      } catch (err) {
        console.warn(`Could not read file ${path}`, err);
      }
    }

    if (newProjectFiles.length > 0) {
        setProjectFiles(newProjectFiles);
        setIsProjectMode(true);
        // Select first file by default
        setSelectedFilePath(newProjectFiles[0].path);
        setEditorContent(newProjectFiles[0].content);
    }
    
    setLoadingState('idle');
    e.target.value = '';
  };

  const clearProject = () => {
    setEditorContent(SAMPLE_CODE);
    setProjectFiles([]);
    setIsProjectMode(false);
    setSelectedFilePath(null);
    setResult(null);
  };

  const handleFileSelect = (content: string, path: string) => {
    setEditorContent(content);
    setSelectedFilePath(path);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row overflow-hidden">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />
      
      {/* Hidden File Input for Folder Select */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFolderUpload}
        className="hidden" 
        // @ts-ignore
        webkitdirectory="" 
        directory="" 
        multiple 
      />

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

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2">
                {isProjectMode ? <Layout size={14}/> : <FileText size={14} />}
                {isProjectMode ? 'Project Workspace' : 'Code Input'}
            </span>
            <div className="flex gap-2">
                {isProjectMode && (
                   <button 
                    onClick={clearProject}
                    className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-900/20 px-2 py-1 rounded border border-red-900/50 transition-colors"
                   >
                     <Trash2 size={12} /> Exit Project
                   </button>
                )}
                <button 
                  onClick={handleFolderClick}
                  className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded border border-zinc-700 transition-colors"
                  title="Upload a folder of code"
                >
                  <FolderUp size={12} /> Upload Folder
                </button>
            </div>
          </div>

          <div className="flex-1 flex gap-4 min-h-0">
             {/* Project Explorer (Only in Project Mode) */}
             {isProjectMode && (
                <div className="w-1/3 min-w-[200px] h-full">
                    <FileExplorer 
                        files={projectFiles} 
                        onFileSelect={handleFileSelect}
                        selectedPath={selectedFilePath}
                    />
                </div>
             )}

             {/* Code Editor */}
             <div className="flex-1 flex flex-col relative h-full">
                {isProjectMode && selectedFilePath && (
                    <div className="absolute top-0 right-0 bg-zinc-900/80 text-zinc-500 text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-lg border-l border-b border-zinc-800 z-10 backdrop-blur font-mono">
                        {selectedFilePath}
                    </div>
                )}
                <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="w-full h-full bg-[#0d0d10] text-sm font-mono text-zinc-300 p-4 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 border border-zinc-800 transition-all placeholder:text-zinc-700 custom-scrollbar"
                    placeholder="// Paste your code here..."
                    spellCheck={false}
                />
             </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-zinc-500 hidden sm:block">
               {isProjectMode ? `Context: ${projectFiles.length} files loaded` : 'Supported: Python, JS, C++, Rust...'}
            </div>
            <button
                onClick={handleAnalyze}
                disabled={loadingState === 'analyzing' || (!editorContent.trim() && projectFiles.length === 0)}
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
                    <span>Analyzing...</span>
                </>
                ) : (
                <>
                    <Sparkles size={18} className="text-purple-600 group-hover:rotate-12 transition-transform" />
                    <span>Explain {isProjectMode ? 'Project' : 'It'}</span>
                    <ArrowRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                </>
                )}
            </button>
        </div>
      </div>

      {/* RIGHT PANEL: Output */}
      <div className="w-full lg:w-1/2 bg-zinc-950/50 p-6 h-screen overflow-y-auto relative custom-scrollbar">
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
                <StructuralView data={result.structural} domain={result.domain} />
              )}

              {activeTab === 'visual' && (
                <Visualizer 
                    mermaidCode={result.visual.mermaidCode}
                    asciiArt={result.visual.nanoBananaAscii}
                    description={result.visual.explanation}
                    onRegenerate={handleRegenerateVisuals}
                    isRegenerating={isRegeneratingVisuals}
                />
              )}

              {activeTab === 'quiz' && (
                <QuizView 
                    questions={result.quiz} 
                    onRegenerate={handleRegenerateQuiz}
                    isRegenerating={isRegeneratingQuiz}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
