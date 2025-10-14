import { ModelRecommendation } from './model-types';

// Curated model catalog with hardware requirements and recommendations
// Updated with latest models: Qwen 3, Gemma 3, Llama 3.2, Phi-3
export const MODEL_CATALOG: ModelRecommendation[] = [
  {
    name: 'gemma3:270m',
    displayName: 'Gemma 3 (270M)',
    description: 'Ultra-lightweight model, fastest responses for simple tasks',
    size: 292000000, // ~292MB
    parameterSize: '270M',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '2GB',
      recommendedRAM: '4GB',
      cpuOnly: true,
      approxSpeed: '~120 tokens/sec on modern CPU'
    },
    useCases: ['Ultra-fast chat', 'Simple Q&A', 'Low-end devices']
  },
  {
    name: 'qwen3:0.6b',
    displayName: 'Qwen 3 (0.6B)',
    description: 'Ultra-lightweight Qwen 3, great for basic tasks',
    size: 523000000, // ~523MB
    parameterSize: '0.6B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '2GB',
      recommendedRAM: '4GB',
      cpuOnly: true,
      approxSpeed: '~100 tokens/sec on modern CPU'
    },
    useCases: ['Quick responses', 'Simple tasks', 'Code completion']
  },
  {
    name: 'gemma3:1b',
    displayName: 'Gemma 3 (1B)',
    description: 'Google\'s latest lightweight model, excellent balance',
    size: 815000000, // ~815MB
    parameterSize: '1B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '4GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~80 tokens/sec on modern CPU'
    },
    useCases: ['Chat', 'General tasks', 'Content creation']
  },
  {
    name: 'llama3.2:1b',
    displayName: 'Llama 3.2 (1B)',
    description: 'Meta\'s lightweight model, very fast and efficient',
    size: 1300000000, // ~1.3GB
    parameterSize: '1B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '4GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~70 tokens/sec on modern CPU'
    },
    useCases: ['Quick chat', 'Simple tasks', 'Low-resource devices']
  },
  {
    name: 'qwen3:1.7b',
    displayName: 'Qwen 3 (1.7B)',
    description: 'Latest Qwen 3, fast and capable for most tasks',
    size: 1400000000, // ~1.4GB
    parameterSize: '1.7B',
    recommended: true,
    category: 'lightweight',
    hardwareRequirements: {
      minRAM: '4GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~60 tokens/sec on modern CPU'
    },
    useCases: ['General chat', 'Basic reasoning', 'Content generation']
  },
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 (3B)',
    description: 'Meta\'s balanced model with good quality',
    size: 2000000000, // ~2GB
    parameterSize: '3B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '6GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~45 tokens/sec on modern CPU'
    },
    useCases: ['General purpose', 'Good quality', 'Reasonable speed']
  },
  {
    name: 'phi3:3.8b',
    displayName: 'Phi-3 (3.8B)',
    description: 'Microsoft\'s efficient model, great for coding',
    size: 2300000000, // ~2.3GB
    parameterSize: '3.8B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '6GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~40 tokens/sec on modern CPU'
    },
    useCases: ['Code generation', 'Technical Q&A', 'Reasoning']
  },
  {
    name: 'qwen3:4b',
    displayName: 'Qwen 3 (4B)',
    description: 'Qwen 3 with 256K context, excellent for complex tasks',
    size: 2500000000, // ~2.5GB
    parameterSize: '4B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '6GB',
      recommendedRAM: '8GB',
      cpuOnly: true,
      approxSpeed: '~40 tokens/sec on modern CPU'
    },
    useCases: ['Long documents', 'Code analysis', 'Detailed reasoning']
  },
  {
    name: 'gemma3:4b',
    displayName: 'Gemma 3 (4B) - Multimodal',
    description: 'Google\'s multimodal model, supports text and images',
    size: 3300000000, // ~3.3GB
    parameterSize: '4B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '8GB',
      recommendedRAM: '12GB',
      cpuOnly: true,
      approxSpeed: '~35 tokens/sec on modern CPU'
    },
    useCases: ['Image understanding', 'Visual Q&A', 'Multimodal tasks']
  },
  {
    name: 'qwen3:8b',
    displayName: 'Qwen 3 (8B)',
    description: 'Qwen 3 flagship, high quality for demanding tasks',
    size: 5200000000, // ~5.2GB
    parameterSize: '8B',
    recommended: true,
    category: 'balanced',
    hardwareRequirements: {
      minRAM: '8GB',
      recommendedRAM: '16GB',
      minVRAM: '6GB',
      cpuOnly: false,
      approxSpeed: '~30 tokens/sec on M1, ~20 tokens/sec CPU'
    },
    useCases: ['Complex reasoning', 'Long-form content', 'Technical writing']
  },
  {
    name: 'qwen3:14b',
    displayName: 'Qwen 3 (14B)',
    description: 'Larger Qwen 3 model for highest quality output',
    size: 9300000000, // ~9.3GB
    parameterSize: '14B',
    recommended: false,
    category: 'powerful',
    hardwareRequirements: {
      minRAM: '16GB',
      recommendedRAM: '24GB',
      minVRAM: '12GB',
      cpuOnly: false,
      approxSpeed: '~20 tokens/sec on M1, ~12 tokens/sec CPU'
    },
    useCases: ['Professional writing', 'Complex analysis', 'Research']
  },
  {
    name: 'gemma3:12b',
    displayName: 'Gemma 3 (12B) - Multimodal',
    description: 'Large multimodal model with 128K context',
    size: 8100000000, // ~8.1GB
    parameterSize: '12B',
    recommended: false,
    category: 'powerful',
    hardwareRequirements: {
      minRAM: '16GB',
      recommendedRAM: '24GB',
      minVRAM: '10GB',
      cpuOnly: false,
      approxSpeed: '~18 tokens/sec on M1'
    },
    useCases: ['Advanced vision tasks', 'Document analysis', 'Complex multimodal']
  },
];

// Helper function to get recommendation for a model
export function getModelRecommendation(modelName: string): ModelRecommendation | undefined {
  // Extract base name (handle variants like qwen3:8b, qwen3:8b-chat, etc.)
  const baseName = modelName.split(':')[0];
  const variant = modelName.split(':')[1]?.split('-')[0];

  return MODEL_CATALOG.find(rec => {
    const recBaseName = rec.name.split(':')[0];
    const recVariant = rec.name.split(':')[1];
    return recBaseName === baseName && recVariant === variant;
  });
}

// Helper function to format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to get models by category
export function getModelsByCategory(category: 'lightweight' | 'balanced' | 'powerful'): ModelRecommendation[] {
  return MODEL_CATALOG.filter(model => model.category === category);
}

// Helper function to get hardware-appropriate recommendations
export function getRecommendedModelsForRAM(availableRAM: number): ModelRecommendation[] {
  return MODEL_CATALOG.filter(model => {
    const minRAM = parseInt(model.hardwareRequirements.minRAM);
    return minRAM <= availableRAM;
  }).sort((a, b) => {
    // Sort by quality (larger models first) within the available RAM
    const sizeA = parseInt(a.parameterSize);
    const sizeB = parseInt(b.parameterSize);
    return sizeB - sizeA;
  });
}
