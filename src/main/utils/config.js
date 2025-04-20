import fs from 'fs';
import path from 'path';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'config.json');

const DEFAULT_CONFIG = {
  coinScreen: {
    insertMessage: 'INSERT COIN',
    infoMessage: 'Insert Coin to enter Game Library and choose a Game to play!',
    konamiCodeEnabled: false
  }
};

const ensureConfigFile = () => {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      const dirPath = path.dirname(CONFIG_FILE_PATH);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
  } catch (error) {
    console.error('Error creating config file:', error);
  }
};

export const loadConfig = () => {
  ensureConfigFile();
  
  try {
    const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading config:', error);
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = (config) => {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
};

export const getConfig = (section) => {
  const config = loadConfig();
  return section ? config[section] : config;
};

export const updateConfig = (section, data) => {
  const config = loadConfig();
  config[section] = { ...config[section], ...data };
  return saveConfig(config);
};

ensureConfigFile();