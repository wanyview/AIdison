export enum DimensionType {
  TRUE = 'TRUE',
  GOOD = 'GOOD',
  BEAUTIFUL = 'BEAUTIFUL',
  SPIRIT = 'SPIRIT'
}

export interface Dimension {
  id: DimensionType;
  name: string;
  subTitle: string;
  description: string;
  color: string;
  icon: string;
}

export interface KnowledgeCapsule {
  id: string;
  dimensionId: DimensionType;
  title: string;
  description: string;
  significance: string; // Why is this Edison/Newton level?
  discoveredBy?: string;
  year?: string;
  parents?: string[]; // IDs of the capsules that were fused to create this
}

export interface AgentStats {
  riskTolerance: number; // 0-1 (Conservative -> Radical)
  creativityBias: number; // 0-1 (Analytical -> Abstract)
}

export interface Agent {
  id: string;
  name: string;
  role: 'HOST' | 'CRITIC' | 'VISIONARY' | 'SKEPTIC' | 'SYNTHESIZER' | 'USER_ENVOY' | 'GUEST';
  avatar: string;
  systemPrompt: string;
  isUser?: boolean; // If true, this is the user's custom agent
  stats?: AgentStats;
  knowledgeBase?: string; // Simulating uploaded RAG content
  objective?: string;
}

export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  insightLabel?: string; // e.g., #Biology, #Ethics
}

export enum SalonState {
  SETUP = 'SETUP',     // User configuring their agent
  LOBBY = 'LOBBY',     // Waiting for other agents to join
  ACTIVE = 'ACTIVE',   // Discussion in progress
  COMPLETED = 'COMPLETED' // Knowledge Crystallized
}

export interface SalonParticipant {
  agent: Agent;
  status: 'connecting' | 'online' | 'speaking';
}
