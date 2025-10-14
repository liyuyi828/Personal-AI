// Model-related types and interfaces

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaTagsResponse {
  models: OllamaModel[];
}

export interface ModelRecommendation {
  name: string;
  displayName: string;
  description: string;
  size: number; // in bytes
  parameterSize: string; // e.g., "8B"
  recommended: boolean;
  category: 'lightweight' | 'balanced' | 'powerful';
  hardwareRequirements: {
    minRAM: string;
    recommendedRAM: string;
    minVRAM?: string; // GPU memory
    cpuOnly: boolean;
    approxSpeed: string; // e.g., "~30 tokens/sec on M1"
  };
  useCases: string[];
}

export interface ModelWithRecommendation {
  model: OllamaModel;
  recommendation?: ModelRecommendation;
  installed: boolean;
}

export interface AppConfig {
  version: string;
  selectedModel: string | null;
  lastModelCheck: string | null;
  ollamaBaseUrl: string;
  userPreferences: {
    autoSelectModel: boolean;
    showHardwareWarnings: boolean;
    preferredCategory: 'lightweight' | 'balanced' | 'powerful';
  };
}

export interface ModelPullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

// Chat history types
export interface ChatMessage {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO timestamp
}

export interface ChatSession {
  id: number;
  name: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  messageCount?: number;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}
