"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_CATALOG = void 0;
exports.getModelRecommendation = getModelRecommendation;
exports.formatBytes = formatBytes;
exports.getModelsByCategory = getModelsByCategory;
exports.getRecommendedModelsForRAM = getRecommendedModelsForRAM;
// Curated model catalog with hardware requirements and recommendations
exports.MODEL_CATALOG = [
    {
        name: 'qwen2.5:0.5b',
        displayName: 'Qwen 2.5 (0.5B)',
        description: 'Ultra-lightweight model, great for simple tasks and low-end hardware',
        size: 397000000, // ~397MB
        parameterSize: '0.5B',
        recommended: true,
        category: 'lightweight',
        hardwareRequirements: {
            minRAM: '2GB',
            recommendedRAM: '4GB',
            cpuOnly: true,
            approxSpeed: '~100 tokens/sec on modern CPU'
        },
        useCases: ['Quick responses', 'Simple Q&A', 'Code completion']
    },
    {
        name: 'qwen2.5:1.5b',
        displayName: 'Qwen 2.5 (1.5B)',
        description: 'Lightweight and fast, excellent balance for most laptops',
        size: 934000000, // ~934MB
        parameterSize: '1.5B',
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
        name: 'qwen2.5:3b',
        displayName: 'Qwen 2.5 (3B)',
        description: 'Balanced performance and quality, great for daily use',
        size: 1870000000, // ~1.87GB
        parameterSize: '3B',
        recommended: true,
        category: 'balanced',
        hardwareRequirements: {
            minRAM: '6GB',
            recommendedRAM: '8GB',
            cpuOnly: true,
            approxSpeed: '~40 tokens/sec on modern CPU'
        },
        useCases: ['Detailed responses', 'Code writing', 'Analysis']
    },
    {
        name: 'qwen2.5:7b',
        displayName: 'Qwen 2.5 (7B)',
        description: 'High quality responses, ideal for complex tasks',
        size: 4370000000, // ~4.37GB
        parameterSize: '7B',
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
        name: 'gemma2:2b',
        displayName: 'Gemma 2 (2B)',
        description: 'Google\'s lightweight model with good performance',
        size: 1600000000, // ~1.6GB
        parameterSize: '2B',
        recommended: true,
        category: 'lightweight',
        hardwareRequirements: {
            minRAM: '4GB',
            recommendedRAM: '8GB',
            cpuOnly: true,
            approxSpeed: '~50 tokens/sec on modern CPU'
        },
        useCases: ['Chat', 'Q&A', 'Content creation']
    },
];
// Helper function to get recommendation for a model
function getModelRecommendation(modelName) {
    // Extract base name (handle variants like qwen2.5:7b, qwen2.5:7b-chat, etc.)
    const baseName = modelName.split(':')[0];
    const variant = modelName.split(':')[1]?.split('-')[0];
    return exports.MODEL_CATALOG.find(rec => {
        const recBaseName = rec.name.split(':')[0];
        const recVariant = rec.name.split(':')[1];
        return recBaseName === baseName && recVariant === variant;
    });
}
// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
// Helper function to get models by category
function getModelsByCategory(category) {
    return exports.MODEL_CATALOG.filter(model => model.category === category);
}
// Helper function to get hardware-appropriate recommendations
function getRecommendedModelsForRAM(availableRAM) {
    return exports.MODEL_CATALOG.filter(model => {
        const minRAM = parseInt(model.hardwareRequirements.minRAM);
        return minRAM <= availableRAM;
    }).sort((a, b) => {
        // Sort by quality (larger models first) within the available RAM
        const sizeA = parseInt(a.parameterSize);
        const sizeB = parseInt(b.parameterSize);
        return sizeB - sizeA;
    });
}
