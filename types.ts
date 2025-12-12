export enum CodeDomain {
  AIML = 'AI/ML',
  DSA = 'DSA',
  WEB = 'Web Dev',
  GENERAL = 'General'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExplanationResult {
  domain: CodeDomain;
  complexityScore: number; // 1-10
  layman: {
    analogy: string;
    description: string;
    keyTakeaway: string;
  };
  structural: {
    components: Array<{ name: string; role: string }>;
    flowSteps: string[];
    dependencies: string[];
  };
  visual: {
    mermaidCode: string; // Flowchart definition
    nanoBananaAscii: string; // Fallback/Terminal style
    explanation: string;
  };
  quiz: QuizQuestion[];
  suggestion: string;
}

export type LoadingState = 'idle' | 'analyzing' | 'generating_visuals' | 'complete' | 'error';
