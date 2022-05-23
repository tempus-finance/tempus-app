import ConfigManager from './ConfigManager';

let configManager: ConfigManager | null = null;
export const getConfigManager = (): ConfigManager => {
  if (!configManager) {
    configManager = new ConfigManager();
  }

  return configManager;
};
