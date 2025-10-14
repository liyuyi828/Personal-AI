import { OllamaModel, OllamaTagsResponse, ModelRecommendation, ModelWithRecommendation, ModelPullProgress } from './lib/model-types';
import { MODEL_CATALOG, getModelRecommendation } from './lib/model-catalog';
import { configManager } from './config-store';

export class ModelManager {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || configManager.getOllamaBaseUrl();
  }

  /**
   * Get all models available on the local Ollama instance
   */
  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data = await response.json() as OllamaTagsResponse;
      return data.models || [];
    } catch (error) {
      console.error('Error fetching available models:', error);
      throw error;
    }
  }

  /**
   * Get model details
   */
  async getModelDetails(modelName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch model details: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching model details:', error);
      throw error;
    }
  }

  /**
   * Check if a specific model is installed
   */
  async isModelInstalled(modelName: string): Promise<boolean> {
    try {
      const models = await this.getAvailableModels();
      return models.some(model => model.name === modelName);
    } catch (error) {
      console.error('Error checking model installation:', error);
      return false;
    }
  }

  /**
   * Pull/download a model from Ollama registry
   */
  async pullModel(
    modelName: string,
    onProgress?: (progress: ModelPullProgress) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const progress: ModelPullProgress = JSON.parse(line);
            if (onProgress) {
              onProgress(progress);
            }
          } catch (e) {
            console.error('Error parsing progress JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error pulling model:', error);
      throw error;
    }
  }

  /**
   * Validate if a model exists and is usable
   */
  async validateModel(modelName: string): Promise<boolean> {
    try {
      await this.getModelDetails(modelName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get recommended models from catalog
   */
  getRecommendedModels(): ModelRecommendation[] {
    return MODEL_CATALOG.filter(model => model.recommended);
  }

  /**
   * Get all catalog models
   */
  getAllCatalogModels(): ModelRecommendation[] {
    return MODEL_CATALOG;
  }

  /**
   * Get models by category
   */
  getModelsByCategory(category: 'lightweight' | 'balanced' | 'powerful'): ModelRecommendation[] {
    return MODEL_CATALOG.filter(model => model.category === category);
  }

  /**
   * Combine installed models with recommendations
   */
  async getModelsWithRecommendations(): Promise<ModelWithRecommendation[]> {
    try {
      const installedModels = await this.getAvailableModels();
      const catalogModels = this.getAllCatalogModels();

      // Create a map of installed models
      const installedMap = new Map<string, OllamaModel>();
      installedModels.forEach(model => {
        installedMap.set(model.name, model);
      });

      // Combine catalog with installed status
      const combined: ModelWithRecommendation[] = catalogModels.map(rec => {
        const installed = installedMap.get(rec.name);
        return {
          model: installed || {
            name: rec.name,
            modified_at: '',
            size: rec.size,
            digest: '',
            details: {
              parameter_size: rec.parameterSize
            }
          },
          recommendation: rec,
          installed: !!installed
        };
      });

      // Add any installed models not in catalog
      installedModels.forEach(model => {
        const inCatalog = catalogModels.some(rec => rec.name === model.name);
        if (!inCatalog) {
          combined.push({
            model,
            recommendation: getModelRecommendation(model.name),
            installed: true
          });
        }
      });

      return combined;
    } catch (error) {
      console.error('Error getting models with recommendations:', error);
      throw error;
    }
  }

  /**
   * Select and persist a model
   */
  async selectModel(modelName: string): Promise<void> {
    // Validate model exists or is in catalog
    const isInstalled = await this.isModelInstalled(modelName);
    const inCatalog = MODEL_CATALOG.some(rec => rec.name === modelName);

    if (!isInstalled && !inCatalog) {
      throw new Error(`Model ${modelName} is not installed and not in catalog`);
    }

    configManager.setSelectedModel(modelName);
  }

  /**
   * Get the currently selected model
   */
  getSelectedModel(): string | null {
    return configManager.getSelectedModel();
  }

  /**
   * Check if model is configured and valid
   */
  async isConfiguredModelValid(): Promise<boolean> {
    const selectedModel = this.getSelectedModel();
    if (!selectedModel) return false;

    return await this.isModelInstalled(selectedModel);
  }

  /**
   * Auto-select a model based on installed models and preferences
   */
  async autoSelectModel(): Promise<string | null> {
    try {
      const installedModels = await this.getAvailableModels();

      if (installedModels.length === 0) {
        return null;
      }

      const preferences = configManager.getUserPreferences();

      // Try to find a recommended model in the preferred category
      const categoryModels = this.getModelsByCategory(preferences.preferredCategory);
      for (const recModel of categoryModels) {
        if (installedModels.some(m => m.name === recModel.name)) {
          await this.selectModel(recModel.name);
          return recModel.name;
        }
      }

      // Fall back to any recommended installed model
      for (const recModel of this.getRecommendedModels()) {
        if (installedModels.some(m => m.name === recModel.name)) {
          await this.selectModel(recModel.name);
          return recModel.name;
        }
      }

      // Fall back to the first installed model
      const firstModel = installedModels[0].name;
      await this.selectModel(firstModel);
      return firstModel;
    } catch (error) {
      console.error('Error auto-selecting model:', error);
      return null;
    }
  }
}

export const modelManager = new ModelManager();
