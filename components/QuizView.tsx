import React, { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (userAnswers[qIndex] !== undefined) return; // Prevent changing answer
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    setShowExplanation(prev => ({ ...prev, [qIndex]: true }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
        <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Knowledge Check</h3>
            <p className="text-zinc-400">Test your understanding of the analyzed code.</p>
        </div>

      {questions.map((q, qIdx) => {
        const isAnswered = userAnswers[qIdx] !== undefined;
        const isCorrect = userAnswers[qIdx] === q.correctIndex;

        return (
          <div key={qIdx} className="glass-panel p-6 rounded-2xl border border-zinc-800 transition-all hover:border-zinc-700">
            <div className="flex items-start gap-4 mb-4">
                <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                    <HelpCircle size={20} />
                </div>
                <h4 className="text-lg font-medium text-white flex-1">{q.question}</h4>
            </div>

            <div className="space-y-3 pl-12">
              {q.options.map((opt, oIdx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center ";
                
                if (isAnswered) {
                  if (oIdx === q.correctIndex) {
                    btnClass += "bg-green-900/20 border-green-500/50 text-green-200";
                  } else if (oIdx === userAnswers[qIdx]) {
                    btnClass += "bg-red-900/20 border-red-500/50 text-red-200";
                  } else {
                    btnClass += "bg-zinc-900/50 border-zinc-800 text-zinc-600 opacity-50";
                  }
                } else {
                  btnClass += "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, oIdx)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <span>{opt}</span>
                    {isAnswered && oIdx === q.correctIndex && <CheckCircle size={18} className="text-green-500" />}
                    {isAnswered && oIdx === userAnswers[qIdx] && oIdx !== q.correctIndex && <XCircle size={18} className="text-red-500" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className={`mt-4 ml-12 p-4 rounded-lg text-sm border-l-2 ${isCorrect ? 'bg-green-900/10 border-green-500 text-green-300' : 'bg-red-900/10 border-red-500 text-red-300'}`}>
                <span className="font-bold block mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};