import Store from 'electron-store';
import { AppConfig } from './lib/model-types';

// Define the schema for type safety and validation
const schema = {
  version: {
    type: 'string',
    default: '1.0.0'
  },
  selectedModel: {
    type: ['string', 'null'],
    default: null
  },
  lastModelCheck: {
    type: ['string', 'null'],
    default: null
  },
  ollamaBaseUrl: {
    type: 'string',
    default: 'http://localhost:11434'
  },
  userPreferences: {
    type: 'object',
    properties: {
      autoSelectModel: {
        type: 'boolean',
        default: true
      },
      showHardwareWarnings: {
        type: 'boolean',
        default: true
      },
      preferredCategory: {
        type: 'string',
        enum: ['lightweight', 'balanced', 'powerful'],
        default: 'lightweight'
      }
    },
    default: {
      autoSelectModel: true,
      showHardwareWarnings: true,
      preferredCategory: 'lightweight'
    }
  }
} as const;

// Create store instance with TypeScript support
export const configStore = new Store<AppConfig>({
  name: 'config',
  schema: schema as any,
  defaults: {
    version: '1.0.0',
    selectedModel: null,
    lastModelCheck: null,
    ollamaBaseUrl: 'http://localhost:11434',
    userPreferences: {
      autoSelectModel: true,
      showHardwareWarnings: true,
      preferredCategory: 'lightweight'
    }
  }
});

// Helper class for type-safe config access
export class ConfigManager {
  private store: Store<AppConfig>;

  constructor() {
    this.store = configStore;
  }

  // Model selection
  getSelectedModel(): string | null {
    return (this.store as any).get('selectedModel');
  }

  setSelectedModel(modelName: string): void {
    (this.store as any).set('selectedModel', modelName);
    (this.store as any).set('lastModelCheck', new Date().toISOString());
  }

  clearSelectedModel(): void {
    (this.store as any).set('selectedModel', null);
  }

  // Ollama base URL
  getOllamaBaseUrl(): string {
    return (this.store as any).get('ollamaBaseUrl');
  }

  setOllamaBaseUrl(url: string): void {
    (this.store as any).set('ollamaBaseUrl', url);
  }

  // User preferences
  getUserPreferences() {
    return (this.store as any).get('userPreferences');
  }

  setUserPreferences(prefs: AppConfig['userPreferences']): void {
    (this.store as any).set('userPreferences', prefs);
  }

  updateUserPreference<K extends keyof AppConfig['userPreferences']>(
    key: K,
    value: AppConfig['userPreferences'][K]
  ): void {
    const prefs = this.getUserPreferences();
    (this.store as any).set('userPreferences', { ...prefs, [key]: value });
  }

  // Check if model is configured
  isModelConfigured(): boolean {
    const model = this.getSelectedModel();
    return model !== null && model !== '';
  }

  // Get last model check timestamp
  getLastModelCheck(): string | null {
    return (this.store as any).get('lastModelCheck');
  }

  // Reset all config to defaults
  reset(): void {
    (this.store as any).clear();
  }

  // Get entire config
  getAll(): AppConfig {
    return (this.store as any).store;
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
