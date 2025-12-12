import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { KnowledgeCapsule, Message, Agent, DimensionType } from '../types';
import { SYSTEM_AGENTS, GUEST_PERSONAS } from '../constants';

// Cache configuration
interface CacheEntry {
  timestamp: number;
  data: KnowledgeCapsule[];
}

const capsuleCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Generate a random guest agent from the persona pool
export const generateGuestAgent = (): Agent => {
    const persona = GUEST_PERSONAS[Math.floor(Math.random() * GUEST_PERSONAS.length)];
    return {
        id: `guest-${Date.now()}-${Math.random()}`,
        name: persona.name || "Guest",
        role: 'GUEST',
        avatar: persona.avatar || "👤",
        systemPrompt: persona.systemPrompt || "You are an intelligent observer."
    };
};

// Simulate a response from a specific agent based on context
export const generateAgentResponse = async (
  agent: Agent,
  capsule: KnowledgeCapsule,
  history: Message[],
  modelName: string = 'gemini-2.5-flash'
): Promise<string> => {
  const ai = getAiClient();
  
  // Format history to look like a script
  const conversationContext = history.map(msg => 
    `${msg.agentId.includes('architect') ? 'The Architect' : 'Participant ' + msg.agentId.slice(0,4)}: ${msg.content}`
  ).join('\n');

  // Incorporate Stats if User Agent
  let statsContext = "";
  if (agent.stats) {
      statsContext = `
      BEHAVIOR MODIFIERS:
      - Risk Tolerance: ${agent.stats.riskTolerance} (0=Cautious, 1=Reckless)
      - Creativity: ${agent.stats.creativityBias} (0=Logic-only, 1=Abstract/Metaphorical)
      - Knowledge Base to reference: "${agent.knowledgeBase?.substring(0, 100)}..."
      `;
  }

  const prompt = `
    Context: TIER Knowledge Salon (Automated Multi-Agent Simulation).
    Topic: ${capsule.title} - ${capsule.description} (${capsule.significance})
    
    YOU ARE: "${agent.name}".
    YOUR AVATAR: ${agent.avatar}
    YOUR INTERNAL PROMPT: 
    "${agent.systemPrompt}"
    ${statsContext}
    
    Current Conversation Transcript:
    ${conversationContext}
    
    INSTRUCTIONS:
    1. Read the transcript.
    2. Speak as your persona.
    3. Respond to the last speaker or the general topic.
    4. Keep it under 60 words (short, punchy, conversational).
    5. Maintain the "Edison/Newton" level of intellect.
    6. Do NOT prefix your response with your name. Just speak.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || "...";
  } catch (error) {
    console.error("Error generating agent response:", error);
    return "...";
  }
};

// Function to determine if a new capsule has emerged
export const checkForEmergence = async (
  history: Message[],
  baseCapsule: KnowledgeCapsule
): Promise<KnowledgeCapsule | null> => {
  const ai = getAiClient();
  const conversationContext = history.map(msg => `${msg.content}`).join('\n');
  
  const prompt = `
    Analyze the following high-level salon discussion about "${baseCapsule.title}".
    Conversation: ${conversationContext}
    
    Has the group synthesized a NEW, distinct knowledge concept?
    
    If yes, return JSON: { "title": "...", "description": "...", "significance": "..." }
    If no, return string "NO".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text?.trim();
    if (!text || text.includes("NO")) return null;
    
    try {
      const data = JSON.parse(text);
      if (data.title) {
        return {
          id: `new-${Date.now()}`,
          dimensionId: DimensionType.SPIRIT,
          title: data.title,
          description: data.description,
          significance: data.significance || "Emerged from salon discussion.",
          discoveredBy: "Commander Envoy & TIER Collective",
          year: new Date().getFullYear().toString()
        };
      }
    } catch (e) {
      return null;
    }
  } catch (error) {
    return null;
  }
  return null;
};

// Helper to generate more capsules if needed
export const discoverMoreCapsules = async (
  dimension: DimensionType, 
  existingTitles: string[],
  count: number = 5,
  excludeKeywords: string[] = []
): Promise<KnowledgeCapsule[]> => {
  const sortedTitles = [...existingTitles].sort().join('|');
  const sortedKeywords = [...excludeKeywords].sort().join('|');
  const cacheKey = `DISCOVER_${dimension}_${count}_${sortedTitles}_${sortedKeywords}`;

  const cached = capsuleCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const ai = getAiClient();
  
  const excludeText = excludeKeywords.length > 0 
    ? `STRICTLY EXCLUDE concepts related to: ${excludeKeywords.join(', ')}.` 
    : '';

  const prompt = `
    Act as a curator of the "TIER Knowledge Salon".
    Generate ${count} NEW, DISTINCT knowledge capsules for the dimension: "${dimension}".
    
    CRITERIA: Edison/Newton level magnitude. Civilization shifting.
    
    EXCLUDE: ${existingTitles.join(', ')}
    ${excludeText}
    
    OUTPUT JSON Array:
    [{ "title": "...", "description": "...", "significance": "...", "discoveredBy": "...", "year": "..." }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    const results = data.map((item: any, idx: number) => ({
      id: `gen-${dimension}-${Date.now()}-${idx}`,
      dimensionId: dimension,
      ...item
    }));

    capsuleCache.set(cacheKey, {
      timestamp: Date.now(),
      data: results
    });

    return results;
  } catch (error) {
    console.error("Failed to discover capsules", error);
    return [];
  }
};

export const fuseCapsules = async (
  capsuleA: KnowledgeCapsule,
  capsuleB: KnowledgeCapsule
): Promise<KnowledgeCapsule | null> => {
  const ai = getAiClient();

  const prompt = `
    Act as a "Radical Scientific Innovator".
    Perform a 'Conceptual Fusion' of:
    1. ${capsuleA.title}
    2. ${capsuleB.title}
    
    Propose a concrete HYPOTHETICAL DISCOVERY (Nobel Prize level).
    
    OUTPUT JSON:
    { "title": "...", "description": "...", "significance": "...", "discoveredBy": "TIER Fusion Lab" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return {
      id: `fused-${Date.now()}`,
      dimensionId: DimensionType.SPIRIT,
      title: data.title,
      description: data.description,
      significance: data.significance,
      discoveredBy: data.discoveredBy,
      year: "Future Era",
      parents: [capsuleA.id, capsuleB.id]
    };

  } catch (error) {
    return null;
  }
};

export const mockEmergence = (): KnowledgeCapsule => {
    return {
        id: `mock-${Date.now()}`,
        dimensionId: DimensionType.SPIRIT,
        title: "Quantum Biocentrism",
        description: "The theory that biology creates the universe, not the other way around.",
        significance: "Redefines existence by placing life at the center of reality.",
        discoveredBy: "TIER Collective (Demo)",
        year: "2025"
    }
}

// Latent Space Telepathy Scanner
export const scanLatentSpace = async (
  capsuleA: KnowledgeCapsule,
  capsuleB: KnowledgeCapsule
): Promise<string | null> => {
    // 30% chance to fail immediately to simulate scarcity of true latent connections
    if (Math.random() > 0.7) return null;

    const ai = getAiClient();
    const prompt = `
        Task: Latent Structural Analysis (Telepathy Protocol).
        Analyze the hidden structural isomorphism between:
        A: ${capsuleA.title} (${capsuleA.description})
        B: ${capsuleB.title} (${capsuleB.description})

        Are these two concepts deeply connected by a shared underlying logic, mechanism, or philosophical principle? 
        (Ignore surface-level text differences. Look for "Latent Representations").

        If YES: Return a very short, cryptic insight (max 10 words).
        If NO: Return exact string "NO".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text?.trim();
        if (!text || text === "NO" || text.includes("NO")) return null;
        return text;
    } catch (e) {
        return null;
    }
};