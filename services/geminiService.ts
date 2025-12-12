
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExplanationResult, CodeDomain, QuizQuestion } from "../types";

// Using the provided environment variable
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    domain: { type: Type.STRING, enum: [
      CodeDomain.AIML, CodeDomain.DSA, CodeDomain.WEB, CodeDomain.MOBILE, CodeDomain.PYTHON, CodeDomain.JAVASCRIPT, CodeDomain.GENERAL
    ]},
    complexityScore: { type: Type.INTEGER },
    layman: {
      type: Type.OBJECT,
      properties: {
        analogy: { type: Type.STRING },
        description: { type: Type.STRING },
        keyTakeaway: { type: Type.STRING }
      },
      required: ['analogy', 'description', 'keyTakeaway']
    },
    structural: {
      type: Type.OBJECT,
      properties: {
        framework: { type: Type.STRING },
        architecture: { type: Type.STRING },
        components: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING }
            }
          }
        },
        flowSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
        
        // Specific Contexts
        dsaTrace: {
          type: Type.ARRAY,
          description: "ONLY IF DSA: Dry-run simulation.",
          items: {
            type: Type.OBJECT,
            properties: {
              step: { type: Type.INTEGER },
              description: { type: Type.STRING },
              variables: { type: Type.STRING }
            }
          }
        },
        reactAnalysis: {
          type: Type.ARRAY,
          description: "ONLY IF WEB/REACT.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['container', 'presentational', 'hook'] },
              hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
              stateVariables: { type: Type.ARRAY, items: { type: Type.STRING } },
              props: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        mobileAnalysis: {
          type: Type.ARRAY,
          description: "ONLY IF MOBILE/EXPO.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              route: { type: Type.STRING },
              purpose: { type: Type.STRING },
              nativeFeatures: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        pythonAnalysis: {
          type: Type.ARRAY,
          description: "ONLY IF PYTHON SCRIPT.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['class', 'function', 'variable', 'decorator'] },
              details: { type: Type.STRING, description: "Args, inheritance, or values" },
              docstring: { type: Type.STRING, description: "Brief purpose summary" }
            }
          }
        },
        jsAnalysis: {
          type: Type.ARRAY,
          description: "ONLY IF JS/TS SCRIPT (Node/Utility).",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['function', 'class', 'variable', 'export'] },
              isAsync: { type: Type.BOOLEAN },
              description: { type: Type.STRING }
            }
          }
        }
      },
      required: ['components', 'flowSteps', 'dependencies']
    },
    visual: {
      type: Type.OBJECT,
      properties: {
        mermaidCode: { type: Type.STRING },
        nanoBananaAscii: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ['mermaidCode', 'nanoBananaAscii', 'explanation']
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ['question', 'options', 'correctIndex', 'explanation']
      }
    },
    suggestion: { type: Type.STRING }
  },
  required: ['domain', 'complexityScore', 'layman', 'structural', 'visual', 'quiz', 'suggestion']
};

export const analyzeCode = async (code: string): Promise<ExplanationResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    You are VibeCode Explainer. Analyze the provided code.

    1. **Identify the Sector (PICK ONE)**:
       - **DSA**: Algorithms, data structures, LeetCode style logic.
       - **Web/React**: React components, hooks, JSX, DOM interaction.
       - **Mobile/Expo**: React Native, Expo APIs, screens, navigation.
       - **Python**: Python scripts, classes, data processing, backend logic.
       - **JavaScript**: JS/TS scripts, Node.js, utilities, async logic (non-UI).
       - **General**: Generic C++, Rust, Go, or mixed files not fitting above.

    2. **Populate the Structural Layer**:
       - **IF DSA**: Fill \`dsaTrace\`. Simulate execution with a sample input. Show key variable changes.
       - **IF WEB/REACT**: Fill \`reactAnalysis\`. Break down components, props, and hooks.
       - **IF MOBILE**: Fill \`mobileAnalysis\`. Break down screens and native features.
       - **IF PYTHON**: Fill \`pythonAnalysis\`. List classes, key functions, decorators.
       - **IF JAVASCRIPT**: Fill \`jsAnalysis\`. List exports, async functions, key logic blocks.
       - **IF GENERAL**: Focus on \`components\` and \`flowSteps\`.

    3. **Visuals**:
       - Create a Mermaid Graph (graph TD) showing the flow/architecture.
       - Use \\n for newlines in labels. Wrap text in double quotes.

    Code to Analyze:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ExplanationResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateQuiz = async (code: string, count: number): Promise<QuizQuestion[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    You are VibeCode Explainer.
    Generate exactly ${count} multiple-choice quiz questions based on the following code.
    
    Code Context:
    ${code}
  `;

  const quizSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
      },
      required: ['question', 'options', 'correctIndex', 'explanation']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz generation failed:", error);
    throw error;
  }
};

export const regenerateVisuals = async (code: string): Promise<ExplanationResult['visual']> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    You are VibeCode Explainer.
    Regenerate the Visual Analysis for the following code.
    
    Code Context:
    ${code}

    Requirements:
    1. Mermaid Graph: Valid 'graph TD'. Use \\n for newlines, "quotes" for labels.
    2. Nano Banana ASCII: Creative ASCII art.
    3. Explanation: Brief description.
  `;

  const visualSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      mermaidCode: { type: Type.STRING },
      nanoBananaAscii: { type: Type.STRING },
      explanation: { type: Type.STRING }
    },
    required: ['mermaidCode', 'nanoBananaAscii', 'explanation']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: visualSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ExplanationResult['visual'];
  } catch (error) {
    console.error("Visual regeneration failed:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio generated");
    
    return audioData;
  } catch (error) {
    console.error("TTS failed:", error);
    throw error;
  }
};
