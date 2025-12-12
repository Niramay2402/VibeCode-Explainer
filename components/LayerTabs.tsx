import React from 'react';
import { Layers, Box, Eye, Activity } from 'lucide-react';

interface LayerTabsProps {
  activeTab: 'layman' | 'structural' | 'visual' | 'quiz';
  onTabChange: (tab: 'layman' | 'structural' | 'visual' | 'quiz') => void;
}

export const LayerTabs: React.FC<LayerTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'layman', label: 'The Vibe', icon: Layers, color: 'text-purple-400' },
    { id: 'structural', label: 'Blueprint', icon: Box, color: 'text-blue-400' },
    { id: 'visual', label: 'Nano Visuals', icon: Eye, color: 'text-green-400' },
    { id: 'quiz', label: 'Quiz Mode', icon: Activity, color: 'text-yellow-400' },
  ] as const;

  return (
    <div className="flex space-x-2 bg-zinc-900/50 p-1 rounded-xl mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300
              ${isActive 
                ? 'bg-zinc-800 shadow-lg text-white font-semibold transform scale-105' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
            `}
          >
            <Icon size={18} className={isActive ? tab.color : ''} />
            <span className={isActive ? '' : 'hidden sm:inline'}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};