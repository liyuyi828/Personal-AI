import { useState, useEffect, useCallback } from 'react';
import { ModelWithRecommendation, ModelPullProgress } from '@/lib/model-types';

export function useModelSelection() {
  const [models, setModels] = useState<ModelWithRecommendation[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isModelConfigured, setIsModelConfigured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<ModelPullProgress | null>(null);

  // Load models and configuration
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in Electron environment
      if (typeof window === 'undefined' || !window.electronAPI) {
        setError('Electron API not available');
        setLoading(false);
        return;
      }

      const [modelsResult, selectedResult, configuredResult] = await Promise.all([
        window.electronAPI.getModelsWithRecommendations(),
        window.electronAPI.getSelectedModel(),
        window.electronAPI.isModelConfigured(),
      ]);

      if (modelsResult.success) {
        setModels(modelsResult.models);
      } else {
        setError(modelsResult.error || 'Failed to load models');
      }

      if (selectedResult.success) {
        setSelectedModel(selectedResult.model);
      }

      if (configuredResult.success) {
        setIsModelConfigured(configuredResult.configured);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a model
  const selectModel = useCallback(async (modelName: string) => {
    try {
      if (!window.electronAPI) {
        setError('Electron API not available');
        return false;
      }

      setError(null);
      const result = await window.electronAPI.selectModel(modelName);

      if (result.success) {
        setSelectedModel(modelName);
        setIsModelConfigured(true);
        return true;
      } else {
        setError(result.error || 'Failed to select model');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  // Check if a model is installed
  const checkModelInstalled = useCallback(async (modelName: string): Promise<boolean> => {
    try {
      if (!window.electronAPI) return false;

      const result = await window.electronAPI.isModelInstalled(modelName);
      return result.success ? result.installed : false;
    } catch (err) {
      console.error('Error checking model installation:', err);
      return false;
    }
  }, []);

  // Pull/download a model
  const pullModel = useCallback(async (modelName: string) => {
    try {
      if (!window.electronAPI) {
        setError('Electron API not available');
        return false;
      }

      setError(null);
      setPullingModel(modelName);
      setPullProgress(null);

      // Set up progress listener
      window.electronAPI.onModelPullProgress((progress) => {
        setPullProgress(progress);
      });

      const result = await window.electronAPI.pullModel(modelName);

      // Clean up progress listener
      window.electronAPI.removeModelPullProgressListener();

      if (result.success) {
        setPullingModel(null);
        setPullProgress(null);
        // Reload models to update installed status
        await loadModels();
        return true;
      } else {
        setError(result.error || 'Failed to pull model');
        setPullingModel(null);
        setPullProgress(null);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPullingModel(null);
      setPullProgress(null);
      if (window.electronAPI) {
        window.electronAPI.removeModelPullProgressListener();
      }
      return false;
    }
  }, [loadModels]);

  // Install and select a model
  const installAndSelectModel = useCallback(async (modelName: string) => {
    const success = await pullModel(modelName);
    if (success) {
      return await selectModel(modelName);
    }
    return false;
  }, [pullModel, selectModel]);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return {
    models,
    selectedModel,
    isModelConfigured,
    loading,
    error,
    pullingModel,
    pullProgress,
    loadModels,
    selectModel,
    checkModelInstalled,
    pullModel,
    installAndSelectModel,
  };
}
