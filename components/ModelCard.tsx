'use client';

import { ModelWithRecommendation } from '@/lib/model-types';
import { formatBytes } from '@/lib/model-catalog';

interface ModelCardProps {
  modelData: ModelWithRecommendation;
  isSelected: boolean;
  isPulling: boolean;
  onSelect: (modelName: string) => void;
  onInstall: (modelName: string) => void;
}

export function ModelCard({
  modelData,
  isSelected,
  isPulling,
  onSelect,
  onInstall,
}: ModelCardProps) {
  const { model, recommendation, installed } = modelData;

  const handleAction = () => {
    if (installed) {
      onSelect(model.name);
    } else {
      onInstall(model.name);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'lightweight':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'balanced':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'powerful':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">
              {recommendation?.displayName || model.name}
            </h3>
            {installed && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Installed
              </span>
            )}
            {recommendation?.category && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                  recommendation.category
                )}`}
              >
                {recommendation.category}
              </span>
            )}
          </div>

          {recommendation?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {recommendation.description}
            </p>
          )}

          {recommendation && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>📦 {formatBytes(model.size)}</span>
                <span>💾 {recommendation.hardwareRequirements.recommendedRAM} RAM</span>
                {recommendation.hardwareRequirements.minVRAM && (
                  <span>🎮 {recommendation.hardwareRequirements.minVRAM} VRAM</span>
                )}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                ⚡ {recommendation.hardwareRequirements.approxSpeed}
              </div>

              {recommendation.useCases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {recommendation.useCases.map((useCase, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleAction}
            disabled={isPulling || isSelected}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              isSelected
                ? 'bg-blue-500 text-white cursor-default'
                : installed
                ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            {isPulling
              ? 'Downloading...'
              : isSelected
              ? 'Selected'
              : installed
              ? 'Select'
              : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
