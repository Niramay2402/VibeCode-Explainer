import React from 'react';

interface ComplexityMeterProps {
  score: number;
}

export const ComplexityMeter: React.FC<ComplexityMeterProps> = ({ score }) => {
  const getColor = (s: number) => {
    if (s <= 3) return 'bg-green-500 shadow-green-500/50';
    if (s <= 7) return 'bg-yellow-500 shadow-yellow-500/50';
    return 'bg-red-500 shadow-red-500/50';
  };

  const getLabel = (s: number) => {
    if (s <= 3) return 'Breezy';
    if (s <= 7) return 'Moderate';
    return 'Brain Melter';
  };

  return (
    <div className="flex items-center space-x-3 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
      <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Complexity</span>
      <div className="flex space-x-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-6 rounded-full transition-all duration-500 ${
              i < score ? getColor(score) : 'bg-zinc-800'
            } ${i < score ? 'shadow-[0_0_8px_rgba(0,0,0,0.3)]' : ''}`}
          />
        ))}
      </div>
      <span className={`text-sm font-bold ${
          score <= 3 ? 'text-green-400' : score <= 7 ? 'text-yellow-400' : 'text-red-400'
      }`}>
        {score}/10 {getLabel(score)}
      </span>
    </div>
  );
};