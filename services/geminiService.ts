import { GoogleGenAI, Type } from "@google/genai";
import { Scenario, Suspect, ChatMessage, Difficulty, AutoDetectiveAction, Language } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Generate Mystery Scenario with Difficulty
export const generateMysteryScenario = async (difficulty: Difficulty, language: Language): Promise<Scenario> => {
  const ai = getClient();
  
  let configPrompt = "";
  switch (difficulty) {
    case Difficulty.EASY:
      configPrompt = "Generate 3 suspects and 4 clues. The killer should be somewhat obvious upon finding the main clue. Keep the plot straightforward.";
      break;
    case Difficulty.HARD:
      configPrompt = "Generate 5 suspects and 7 clues. Include red herrings. The killer must have a rock-solid looking alibi that is broken by a specific subtle clue. Dark, gritty, unforgiving.";
      break;
    case Difficulty.NORMAL:
    default:
      configPrompt = "Generate 4 suspects and 5 clues. A balanced mystery with one major twist.";
      break;
  }

  const systemPrompt = `
    You are a master mystery writer. Create a procedural murder mystery game scenario.
    
    Settings: ${configPrompt}
    Language: The entire content (Title, bio, clues, etc) MUST be in ${language}.
    
    General Rules:
    - "visualDescription" fields must be optimized for pixel art generation (Keep these in English for better image generation).
    - Ensure one suspect is definitely the killer ('isKiller: true').
    - Link clues to suspects using 'relatedSuspectId' where logical. 
    
    Output JSON format only.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Generate the mystery scenario JSON in ${language}.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          introduction: { type: Type.STRING },
          location: { type: Type.STRING },
          locationVisualDescription: { type: Type.STRING },
          victimName: { type: Type.STRING },
          causeOfDeath: { type: Type.STRING },
          startingTime: { type: Type.STRING, description: "e.g., '19:00'" },
          solutionExplanation: { type: Type.STRING },
          suspects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                bio: { type: Type.STRING },
                isKiller: { type: Type.BOOLEAN },
                secret: { type: Type.STRING },
                visualDescription: { type: Type.STRING }
              },
              required: ["id", "name", "role", "bio", "isKiller", "secret", "visualDescription"]
            }
          },
          clues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                detail: { type: Type.STRING },
                analysisTimeCost: { type: Type.NUMBER },
                relatedSuspectId: { type: Type.STRING, description: "Optional: The ID of the suspect this clue implicates or relates to." }
              },
              required: ["id", "name", "description", "visualDescription", "detail", "analysisTimeCost"]
            }
          }
        },
        required: ["title", "introduction", "location", "locationVisualDescription", "victimName", "causeOfDeath", "suspects", "clues", "solutionExplanation", "startingTime"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as Scenario;
  }
  throw new Error("Failed to generate scenario");
};

// 2. Generate Pixel Art Images
export const generatePixelArt = async (prompt: string): Promise<string> => {
  const ai = getClient();
  // Image prompts work best in English, so we keep the style instructions in English.
  const fullPrompt = `16-bit pixel art style, atmospheric, dark noir palette, detailed, dithered shading, SNES RPG aesthetic. ${prompt}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: { parts: [{ text: fullPrompt }] }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};

// 3. Interrogate Suspect
export const interrogateSuspect = async (
  scenario: Scenario,
  suspect: Suspect,
  chatHistory: ChatMessage[],
  currentQuestion: string,
  knownClues: string[],
  language: Language
): Promise<string> => {
  const ai = getClient();

  const historyText = chatHistory
    .map(m => `${m.sender}: ${m.text}`)
    .join('\n');
  
  const clueContext = knownClues.length > 0 
    ? `Detective knows: ${knownClues.join(', ')}.`
    : "Detective knows little yet.";

  const context = `
    Roleplay as ${suspect.name}, a ${suspect.role}.
    Scenario: ${scenario.victimName} killed at ${scenario.location}.
    Your Bio: ${suspect.bio}
    Secret: ${suspect.secret}
    Killer: ${suspect.isKiller}
    Context: ${clueContext}
    
    History:
    ${historyText}
    
    Detective: "${currentQuestion}"
    
    Reply concisely (max 30 words). Noir style.
    IMPORTANT: Reply in ${language}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: context,
  });

  return response.text || "...";
};

// 4. Auto Detective Logic (Victim Mode)
export const getAutoDetectiveAction = async (
  scenario: Scenario,
  discoveredClueIds: string[],
  interrogatedSuspectIds: string[],
  lastAction: string,
  language: Language,
  chatHistory?: ChatMessage[]
): Promise<AutoDetectiveAction> => {
  const ai = getClient();

  let chatContext = "No recent conversation.";
  if (chatHistory && chatHistory.length > 0) {
      chatContext = "Recent Conversation:\n" + chatHistory.slice(-4).map(m => `${m.sender}: ${m.text}`).join('\n');
  }

  const context = `
    You are playing the role of a brilliant Detective AI solving a murder.
    You must decide the next move.
    
    SCENARIO:
    Title: ${scenario.title}
    Victim: ${scenario.victimName}
    
    GAME STATE:
    Clues Found: ${discoveredClueIds.join(', ') || "None"}
    Clues Available (Unknown): ${scenario.clues.filter(c => !discoveredClueIds.includes(c.id)).map(c => c.id + " (" + c.name + ")").join(', ')}
    
    Suspects Talked To: ${interrogatedSuspectIds.join(', ') || "None"}
    Suspects Available: ${scenario.suspects.map(s => s.id + " (" + s.name + ")").join(', ')}
    
    Last Action: ${lastAction}
    ${chatContext}

    STRATEGY:
    1. Inspect all clues first.
    2. Interrogate suspects after finding clues.
    3. If you have gathered enough evidence and talked to most suspects, ACCUSE the most likely killer (you can peek at the solution if needed to ensure the game ends, but pretend you deduced it).
    
    Output JSON.
    IMPORTANT: The 'thought' and 'question' fields must be written in ${language}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: context,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["INSPECT", "INTERROGATE", "ACCUSE", "THINK"] },
          targetId: { type: Type.STRING, description: "ID of clue or suspect" },
          thought: { type: Type.STRING, description: "Internal monologue (noir style) about why we are doing this." },
          question: { type: Type.STRING, description: "If INTERROGATE, the specific question to ask." }
        },
        required: ["type", "thought"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AutoDetectiveAction;
  }
  
  // Fallback
  return { type: 'THINK', thought: "I need to collect my thoughts..." };
};