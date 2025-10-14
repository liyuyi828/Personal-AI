'use client';

import { useState, useMemo } from 'react';
import { useModelSelection } from '@/hooks/useModelSelection';
import { ModelCard } from './ModelCard';

interface ModelSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onModelSelected?: (modelName: string) => void;
}

export function ModelSelectionDialog({
  isOpen,
  onClose,
  onModelSelected,
}: ModelSelectionDialogProps) {
  const {
    models,
    selectedModel,
    loading,
    error,
    pullingModel,
    pullProgress,
    selectModel,
    installAndSelectModel,
  } = useModelSelection();

  const [filter, setFilter] = useState<'all' | 'lightweight' | 'balanced' | 'powerful'>('all');

  const filteredModels = useMemo(() => {
    if (filter === 'all') return models;
    return models.filter((m) => m.recommendation?.category === filter);
  }, [models, filter]);

  const installedModels = useMemo(
    () => filteredModels.filter((m) => m.installed),
    [filteredModels]
  );

  const notInstalledModels = useMemo(
    () => filteredModels.filter((m) => !m.installed),
    [filteredModels]
  );

  const handleSelectModel = async (modelName: string) => {
    const success = await selectModel(modelName);
    if (success) {
      onModelSelected?.(modelName);
      onClose();
    }
  };

  const handleInstallModel = async (modelName: string) => {
    const success = await installAndSelectModel(modelName);
    if (success) {
      onModelSelected?.(modelName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Select Your AI Model</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Choose a model to start chatting. Lightweight models are recommended for most
            laptops.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {['all', 'lightweight', 'balanced', 'powerful'].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">Error: {error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Installed models */}
              {installedModels.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Installed Models
                  </h3>
                  <div className="space-y-3">
                    {installedModels.map((modelData) => (
                      <ModelCard
                        key={modelData.model.name}
                        modelData={modelData}
                        isSelected={selectedModel === modelData.model.name}
                        isPulling={pullingModel === modelData.model.name}
                        onSelect={handleSelectModel}
                        onInstall={handleInstallModel}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Not installed models */}
              {notInstalledModels.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Available to Download
                  </h3>
                  <div className="space-y-3">
                    {notInstalledModels.map((modelData) => (
                      <ModelCard
                        key={modelData.model.name}
                        modelData={modelData}
                        isSelected={selectedModel === modelData.model.name}
                        isPulling={pullingModel === modelData.model.name}
                        onSelect={handleSelectModel}
                        onInstall={handleInstallModel}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredModels.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No models found in this category.
                </div>
              )}
            </div>
          )}

          {/* Pull progress indicator */}
          {pullingModel && pullProgress && (
            <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
              <div className="flex items-start gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 flex-shrink-0 mt-0.5"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Downloading {pullingModel}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {pullProgress.status}
                  </p>
                  {pullProgress.total && pullProgress.completed && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(pullProgress.completed / pullProgress.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round((pullProgress.completed / pullProgress.total) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
