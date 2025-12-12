import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, HelpCircle, RefreshCw, Settings2 } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onRegenerate: (count: number) => void;
  isRegenerating: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onRegenerate, isRegenerating }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [questionCount, setQuestionCount] = useState(5);

  // Reset answers when questions change
  useEffect(() => {
    setUserAnswers({});
  }, [questions]);

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (userAnswers[qIndex] !== undefined) return; // Prevent changing answer
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h3 className="text-2xl font-bold text-white mb-1">Knowledge Check</h3>
                <p className="text-zinc-400 text-sm">Test your understanding of the analyzed code.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-lg border border-zinc-800">
                    <Settings2 size={14} className="text-zinc-500"/>
                    <select 
                        value={questionCount} 
                        onChange={e => setQuestionCount(Number(e.target.value))}
                        className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer appearance-none pr-4 relative z-10"
                        style={{backgroundImage: 'none'}}
                        disabled={isRegenerating}
                    >
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                    </select>
                </div>
                
                <button 
                    onClick={() => onRegenerate(questionCount)}
                    disabled={isRegenerating}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                >
                    <RefreshCw size={14} className={isRegenerating ? "animate-spin" : ""} />
                    {isRegenerating ? "Generating..." : "Regenerate"}
                </button>
            </div>
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
              <div className={`mt-4 ml-12 p-4 rounded-lg text-sm border-l-2 animate-fadeIn ${isCorrect ? 'bg-green-900/10 border-green-500 text-green-300' : 'bg-red-900/10 border-red-500 text-red-300'}`}>
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