
import React from 'react';
import { ExplanationResult } from '../types';
import { Code, Smartphone, Layout, Zap, Cpu, Terminal, Braces, Box, ArrowRightCircle, BoxSelect, Variable } from 'lucide-react';

interface StructuralViewProps {
  data: ExplanationResult['structural'];
  domain: string;
}

export const StructuralView: React.FC<StructuralViewProps> = ({ data, domain }) => {
  
  // 1. PYTHON REPORT VIEW
  if (data.pythonAnalysis && data.pythonAnalysis.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
          <Terminal className="text-yellow-400" size={24} />
          <div>
            <h3 className="font-bold text-blue-300">Python Script Analysis</h3>
            <p className="text-xs text-blue-200/60">Classes, functions, and logic flow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data.pythonAnalysis.map((item, idx) => (
            <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between p-3 bg-zinc-800/30 border-b border-zinc-800">
                 <div className="flex items-center gap-2">
                    {item.type === 'class' && <Box className="text-blue-400" size={16} />}
                    {item.type === 'function' && <Braces className="text-yellow-400" size={16} />}
                    {item.type === 'decorator' && <Zap className="text-purple-400" size={16} />}
                    {item.type === 'variable' && <Variable className="text-zinc-400" size={16} />}
                    <span className="font-mono text-sm font-bold text-zinc-200">{item.name}</span>
                 </div>
                 <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                   {item.type}
                 </span>
              </div>
              <div className="p-4 space-y-2">
                 {item.details && (
                   <div className="font-mono text-xs text-blue-300 bg-blue-950/30 px-2 py-1 rounded w-fit">
                      {item.details}
                   </div>
                 )}
                 <p className="text-sm text-zinc-400 leading-snug">
                   {item.docstring}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. JAVASCRIPT / NODE REPORT VIEW
  if (data.jsAnalysis && data.jsAnalysis.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-yellow-900/10 p-4 rounded-xl border border-yellow-500/20">
          <Braces className="text-yellow-400" size={24} />
          <div>
            <h3 className="font-bold text-yellow-500">JS Module Breakdown</h3>
            <p className="text-xs text-yellow-200/40">Exports, async functions & logic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.jsAnalysis.map((item, idx) => (
            <div key={idx} className="relative bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 hover:border-yellow-500/30 transition-all group">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                     <span className="font-bold text-zinc-100 font-mono">{item.name}</span>
                     {item.isAsync && (
                       <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-900/50 px-1.5 py-0.5 rounded">Async</span>
                     )}
                  </div>
                  {item.type === 'export' && <ArrowRightCircle size={14} className="text-green-500" />}
               </div>
               <p className="text-sm text-zinc-400 mb-3">{item.description}</p>
               <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Code size={48} />
               </div>
               <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-auto">
                 {item.type}
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. DSA REPORT VIEW
  if (data.dsaTrace && data.dsaTrace.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30">
          <Cpu className="text-indigo-400" size={24} />
          <div>
            <h3 className="font-bold text-indigo-300">Algorithm Simulation</h3>
            <p className="text-xs text-indigo-200/60">Step-by-step dry run of the logic</p>
          </div>
        </div>

        <div className="relative border-l-2 border-zinc-800 ml-4 space-y-8 py-4">
          {data.dsaTrace.map((step, idx) => (
            <div key={idx} className="relative pl-8 group">
              <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-700 group-hover:border-indigo-500 transition-colors" />
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 hover:border-indigo-500/50 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Step {step.step}</span>
                </div>
                <p className="text-zinc-300 text-sm mb-3">{step.description}</p>
                <div className="bg-black/60 p-3 rounded-lg border border-zinc-800/50 font-mono text-xs text-green-400 shadow-inner">
                  <span className="text-zinc-500 select-none mr-2">$ state:</span>
                  {step.variables}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. REACT/WEB REPORT VIEW
  if (data.reactAnalysis && data.reactAnalysis.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30">
          <Layout className="text-cyan-400" size={24} />
          <div>
            <h3 className="font-bold text-cyan-300">Component Blueprint</h3>
            <p className="text-xs text-cyan-200/60">React structure, hooks & state analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data.reactAnalysis.map((comp, idx) => (
            <div key={idx} className="bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden hover:border-cyan-500/30 transition-all">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-cyan-500" />
                  <span className="font-bold text-zinc-200">{comp.name}</span>
                </div>
                <span className={`text-[10px] uppercase px-2 py-1 rounded-full border ${
                  comp.type === 'container' ? 'bg-purple-900/20 text-purple-400 border-purple-800' : 
                  comp.type === 'hook' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800' :
                  'bg-blue-900/20 text-blue-400 border-blue-800'
                }`}>
                  {comp.type}
                </span>
              </div>
              
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Hooks Used</h5>
                  <div className="flex flex-wrap gap-1">
                    {comp.hooks && comp.hooks.length > 0 ? comp.hooks.map((h, i) => (
                      <span key={i} className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 border border-zinc-700">{h}</span>
                    )) : <span className="text-xs text-zinc-600">-</span>}
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] text-zinc-500 uppercase font-bold mb-2">State</h5>
                  <div className="flex flex-wrap gap-1">
                    {comp.stateVariables && comp.stateVariables.length > 0 ? comp.stateVariables.map((s, i) => (
                      <span key={i} className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 border border-zinc-700">{s}</span>
                    )) : <span className="text-xs text-zinc-600">Stateless</span>}
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Props</h5>
                  <div className="flex flex-wrap gap-1">
                    {comp.props && comp.props.length > 0 ? comp.props.map((p, i) => (
                      <span key={i} className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 border border-zinc-700">{p}</span>
                    )) : <span className="text-xs text-zinc-600">No Props</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. MOBILE/EXPO REPORT VIEW
  if (data.mobileAnalysis && data.mobileAnalysis.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
          <Smartphone className="text-emerald-400" size={24} />
          <div>
            <h3 className="font-bold text-emerald-300">Mobile Architecture</h3>
            <p className="text-xs text-emerald-200/60">Screens, routes & native modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.mobileAnalysis.map((screen, idx) => (
            <div key={idx} className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 relative group overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-900/10 rounded-full group-hover:bg-emerald-900/20 transition-colors" />
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white mb-1 text-lg">{screen.name}</h4>
                    <BoxSelect size={18} className="text-zinc-600" />
                </div>
                <code className="text-xs text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded mb-3 block w-fit border border-emerald-900/50">
                    {screen.route}
                </code>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    {screen.purpose}
                </p>
                
                {screen.nativeFeatures && screen.nativeFeatures.length > 0 && (
                    <div className="border-t border-zinc-800 pt-3 mt-auto">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Native Features</span>
                    <div className="flex flex-wrap gap-2">
                        {screen.nativeFeatures.map((feat, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-zinc-300 bg-zinc-800/80 px-2 py-1 rounded-full border border-zinc-700">
                            <Zap size={10} className="text-yellow-500" />
                            {feat}
                        </div>
                        ))}
                    </div>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. FALLBACK / GENERAL REPORT VIEW
  return (
    <div className="space-y-6">
      {/* Architecture & Framework */}
      {(data.architecture || data.framework) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.framework && (
                <div className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-bold">Framework</h4>
                    <p className="text-white font-mono text-sm">{data.framework}</p>
                </div>
            )}
            {data.architecture && (
                <div className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-bold">Architecture</h4>
                    <p className="text-white font-mono text-sm">{data.architecture}</p>
                </div>
            )}
          </div>
      )}

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-blue-400 mb-4">Core Components</h3>
        <div className="space-y-3">
            {data.components.map((comp, i) => (
                <div key={i} className="flex items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                    <div className="bg-blue-500/20 text-blue-400 p-1.5 rounded mr-3 mt-0.5 shrink-0">
                        <Code size={14} />
                    </div>
                    <div>
                        <span className="block text-white font-mono text-sm font-bold mb-1">{comp.name}</span>
                        <span className="text-zinc-400 text-sm leading-snug">{comp.role}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-bold text-zinc-300 ml-1">Execution Flow</h3>
          {data.flowSteps.map((step, i) => (
              <div key={i} className="flex items-center group">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-500 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors shrink-0">
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
            {data.dependencies && data.dependencies.length > 0 ? (
                data.dependencies.map((dep, i) => (
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
  );
};
