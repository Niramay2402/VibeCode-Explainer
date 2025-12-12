import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExplanationResult, CodeDomain } from "../types";

// Using the provided environment variable
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    domain: { type: Type.STRING, enum: [CodeDomain.AIML, CodeDomain.DSA, CodeDomain.WEB, CodeDomain.GENERAL] },
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
        dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['components', 'flowSteps', 'dependencies']
    },
    visual: {
      type: Type.OBJECT,
      properties: {
        mermaidCode: { type: Type.STRING, description: "Raw valid Mermaid.js graph definition. Start immediately with 'graph TD', etc. CRITICAL: Separate EVERY statement with a newline character (\\n). Use semicolons (;) at the end of statements. Wrap ALL node labels in double quotes." },
        nanoBananaAscii: { type: Type.STRING, description: "Creative ASCII art diagram (Nano Banana style)" },
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
    You are VibeCode Explainer, a world-class technical educator.
    Analyze the following code and provide a 3-layer explanation.
    
    Code to Analyze:
    ${code}

    Instructions:
    1. Identify the Domain (AI/ML, DSA, Web Dev, General).
    2. Layer 1 (Layman): Use a creative real-world analogy (No jargon).
    3. Layer 2 (Structural): Breakdown logical flow, complexity, and dependencies.
    4. Layer 3 (Visual): 
       - Generate a valid Mermaid.js graph definition (usually 'graph TD').
       - CRITICAL RULE 1: Use actual newline characters (\\n) in the JSON string to separate statements. The code MUST NOT be a single line.
       - CRITICAL RULE 2: Wrap ALL node text in double quotes. Example: id["Label Text"].
       - CRITICAL RULE 3: Do NOT use markdown backticks in the JSON string.
       - Generate a "Nano Banana" ASCII art representation for terminal vibes.
    5. Create 2-3 quiz questions to test understanding.
    6. Rate complexity 1-10.

    Be vibrant, clear, and educational.
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