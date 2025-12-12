import React, { useState, useMemo, useEffect } from 'react';
import { Maximize2, Terminal, AlertTriangle, X, Code as CodeIcon, Copy, Check, RefreshCw } from 'lucide-react';
import mermaid from 'mermaid';

interface VisualizerProps {
  mermaidCode: string;
  asciiArt: string;
  description: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ mermaidCode, asciiArt, description, onRegenerate, isRegenerating }) => {
  const [mode, setMode] = useState<'graph' | 'ascii'>('graph');
  const [imgError, setImgError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [svgContent, setSvgContent] = useState('');

  // Robust cleaning and Formatting of Mermaid code
  const cleanMermaid = useMemo(() => {
    if (!mermaidCode) return '';
    
    let cleaned = mermaidCode;

    // 1. Handle literal escaped newlines from JSON (e.g. "Line 1\nLine 2")
    cleaned = cleaned.replace(/\\n/g, '\n');

    // 2. Extract from markdown blocks if present
    const codeBlockRegex = /```(?:mermaid)?\s*([\s\S]*?)\s*```/;
    const match = cleaned.match(codeBlockRegex);
    if (match) {
      cleaned = match[1];
    }

    // 3. Remove any "Here is the code" prefix by finding the start of the graph
    const diagramTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 
      'stateDiagram-v2', 'erDiagram', 'gantt', 'pie', 'journey', 'mindmap', 'timeline'
    ];
    
    let startIndex = -1;
    for (const type of diagramTypes) {
      const regex = new RegExp(`(^|\\n)\\s*${type}\\b`, 'i');
      const typeMatch = cleaned.match(regex);
      if (typeMatch && typeMatch.index !== undefined) {
        // Adjust index to start exactly at the keyword
        const matchStr = typeMatch[0];
        const keywordStart = typeMatch.index + matchStr.toLowerCase().indexOf(type.toLowerCase());
        if (startIndex === -1 || keywordStart < startIndex) {
          startIndex = keywordStart;
        }
      }
    }

    if (startIndex !== -1) {
      cleaned = cleaned.substring(startIndex);
    }

    cleaned = cleaned.trim();

    // 4. CRITICAL FIX: Force newlines if the code is compressed into one line
    // If the code has semicolons but no newlines, replace semicolons with newline+semicolon
    if (cleaned.includes(';') && !cleaned.includes('\n')) {
        cleaned = cleaned.replace(/;/g, ';\n');
    }
    
    // 5. Fallback: If it's a 'graph' type but has no newlines and no semicolons, 
    // try to split complex statements (this is aggressive but helps fix "one-liner" errors)
    if (cleaned.startsWith('graph') && !cleaned.includes('\n') && !cleaned.includes(';')) {
         // Add newline after the direction (e.g. "graph TD")
         cleaned = cleaned.replace(/(graph\s+[A-Z]+)/i, '$1\n');
    }

    return cleaned;
  }, [mermaidCode]);

  // Clean ASCII art similarly
  const cleanAscii = useMemo(() => {
    if (!asciiArt) return '';
    return asciiArt
      .replace(/^```(text|ascii)?\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '')
      .replace(/\\n/g, '\n') 
      .trim();
  }, [asciiArt]);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Space Grotesk, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#18181b',
        primaryColor: '#3b82f6',
        secondaryColor: '#a78bfa',
        tertiaryColor: '#27272a',
        primaryTextColor: '#fff',
        secondaryTextColor: '#ddd',
        tertiaryTextColor: '#bbb',
        lineColor: '#52525b',
      }
    });
  }, []);

  // Render Mermaid Graph
  useEffect(() => {
    const renderChart = async () => {
      if (mode === 'graph' && cleanMermaid) {
        try {
          // Generate a unique ID for this render to prevent conflicts
          const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
          // mermaid.render returns an object with svg property in v10+
          const { svg } = await mermaid.render(id, cleanMermaid);
          setSvgContent(svg);
          setImgError(false);
        } catch (error) {
          console.error('Mermaid render failed:', error);
          setImgError(true);
        }
      }
    };
    renderChart();
  }, [mode, cleanMermaid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanMermaid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2 text-2xl">🍌</span> Nano Banana Visuals
        </h3>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-lg border border-blue-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate Diagram"
            >
                <RefreshCw size={14} className={isRegenerating ? "animate-spin" : ""} />
                {isRegenerating ? "Generating..." : "Regenerate"}
            </button>
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                <button
                    onClick={() => setMode('graph')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${mode === 'graph' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Flowchart
                </button>
                <button
                    onClick={() => setMode('ascii')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${mode === 'ascii' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    ASCII
                </button>
            </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute top-4 right-4 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded-lg transition-all backdrop-blur-sm ${showCode ? 'bg-purple-600 text-white' : 'bg-black/60 hover:bg-black/90 text-white'}`}
            title="Inspect Code"
            >
                <CodeIcon size={20} />
            </button>
            <button 
            onClick={() => setIsExpanded(true)}
            className="p-2 bg-black/60 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
            title="Expand View"
            >
                <Maximize2 size={20} />
            </button>
        </div>

        {showCode ? (
            <div className="w-full h-full min-h-[350px] bg-black/80 rounded-xl p-4 overflow-hidden flex flex-col border border-zinc-800">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-500 uppercase font-mono">Mermaid Source</span>
                    <button onClick={handleCopy} className="text-zinc-400 hover:text-white">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                 </div>
                 <pre className="flex-1 font-mono text-xs text-purple-300 overflow-auto whitespace-pre-wrap">
                    {cleanMermaid}
                 </pre>
            </div>
        ) : mode === 'graph' ? (
           <div className="w-full h-full flex flex-col items-center justify-center">
                {imgError || !svgContent ? (
                  <div className="text-center p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 max-w-md">
                     <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-2" />
                     <p className="text-zinc-400 mb-4">Could not render flowchart.</p>
                     <div className="flex flex-col gap-2">
                        <button 
                          onClick={onRegenerate}
                          disabled={isRegenerating}
                          className="flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isRegenerating ? "animate-spin" : ""} />
                            Try Regenerating
                        </button>
                        <button 
                        onClick={() => setMode('ascii')}
                        className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                        Switch to Nano Banana View
                        </button>
                     </div>
                  </div>
                ) : (
                    <div 
                        className="w-full h-full flex items-center justify-center overflow-auto p-4 cursor-pointer hover:scale-[1.01] transition-transform duration-500"
                        onClick={() => setIsExpanded(true)}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                        title="Click to expand"
                    />
                )}
                {!imgError && svgContent && (
                    <p className="mt-4 text-zinc-500 text-xs flex items-center absolute bottom-4">
                        <Maximize2 size={12} className="mr-1"/> Generated via Mermaid.js
                    </p>
                )}
           </div>
        ) : (
            <div className="w-full overflow-x-auto bg-black p-6 rounded-xl border border-zinc-800 shadow-inner relative">
                <pre className="font-mono text-green-500 text-xs sm:text-sm leading-tight whitespace-pre cursor-pointer" onClick={() => setIsExpanded(true)}>
                    {cleanAscii}
                </pre>
                 <p className="mt-4 text-zinc-600 text-xs flex items-center justify-center">
                    <Terminal size={12} className="mr-1"/> Nano Banana ASCII Engine
                </p>
            </div>
        )}
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-xl border-l-4 border-green-500">
        <h4 className="text-sm font-bold text-zinc-300 uppercase mb-1">Visual Analysis</h4>
        <p className="text-zinc-400">{description}</p>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <button 
            onClick={() => setIsExpanded(false)}
            className="absolute top-6 right-6 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors z-20"
          >
            <X size={24} />
          </button>
          
          <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
             {mode === 'graph' ? (
               !imgError && svgContent ? (
                 <div 
                    className="w-full h-full flex items-center justify-center p-8"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                 />
               ) : (
                 <div className="text-red-400">Failed to render image in fullscreen.</div>
               )
             ) : (
                <div className="bg-black p-8 rounded-xl border border-zinc-800 shadow-2xl overflow-auto max-w-full max-h-full">
                    <pre className="font-mono text-green-500 text-sm sm:text-base leading-tight whitespace-pre">
                        {cleanAscii}
                    </pre>
                </div>
             )}
          </div>
          
          <div className="absolute bottom-6 text-zinc-500 text-sm font-medium px-4 py-2 bg-black/50 rounded-full border border-zinc-800">
             {mode === 'graph' ? 'Mermaid Flowchart • Fullscreen' : 'Nano Banana ASCII • Fullscreen'}
          </div>
        </div>
      )}
    </div>
  );
};