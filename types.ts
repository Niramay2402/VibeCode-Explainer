
export enum CodeDomain {
  AIML = 'AI/ML',
  DSA = 'DSA',
  WEB = 'Web/React',
  MOBILE = 'Mobile/Expo',
  PYTHON = 'Python Script',
  JAVASCRIPT = 'JS/TS Script',
  GENERAL = 'General'
}

export interface DsaStep {
  step: number;
  description: string;
  variables: string; // e.g. "i=0, j=1, arr=[5, 3, 1]"
}

export interface ReactComponent {
  name: string;
  type: 'container' | 'presentational' | 'hook';
  hooks: string[];
  stateVariables: string[];
  props: string[];
}

export interface MobileScreen {
  name: string;
  route: string;
  purpose: string;
  nativeFeatures: string[]; // e.g. Camera, Location
}

export interface PythonEntity {
  name: string;
  type: 'class' | 'function' | 'variable' | 'decorator';
  details: string; // args, inheritance info, or value
  docstring: string;
}

export interface JsEntity {
  name: string;
  type: 'function' | 'class' | 'variable' | 'export';
  isAsync: boolean;
  description: string;
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
    framework?: string; 
    architecture?: string; 
    components: Array<{ name: string; role: string }>; // Fallback/General
    flowSteps: string[];
    dependencies: string[];
    
    // Sector Specific Data
    dsaTrace?: DsaStep[];
    reactAnalysis?: ReactComponent[];
    mobileAnalysis?: MobileScreen[];
    pythonAnalysis?: PythonEntity[];
    jsAnalysis?: JsEntity[];
  };
  visual: {
    mermaidCode: string; 
    nanoBananaAscii: string; 
    explanation: string;
  };
  quiz: QuizQuestion[];
  suggestion: string;
}

export type LoadingState = 'idle' | 'analyzing' | 'generating_visuals' | 'complete' | 'error';
