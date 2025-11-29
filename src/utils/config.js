/**
 * Configuration module for the athlete management system
 * Loads environment variables and provides typed configuration
 */

require('dotenv').config();

const config = {
  // Output Sports API Configuration
  outputSports: {
    apiKey: process.env.OUTPUT_SPORTS_API_KEY || '',
    apiUrl: process.env.OUTPUT_SPORTS_API_URL || 'https://api.outputsports.com/v1',
  },

  // Calendar Sync Configuration
  calendar: {
    syncEnabled: process.env.CALENDAR_SYNC_ENABLED === 'true',
    syncIntervalMs: parseInt(process.env.CALENDAR_SYNC_INTERVAL_MS, 10) || 30000,
  },

  // AI Features Configuration
  ai: {
    enabled: process.env.AI_FEATURES_ENABLED === 'true',
    serviceUrl: process.env.AI_SERVICE_URL || '',
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

/**
 * Validates that required configuration values are present
 * @returns {Object} Validation result with isValid boolean and missing array
 */
function validateConfig() {
  const missing = [];
  
  if (!config.outputSports.apiKey) {
    missing.push('OUTPUT_SPORTS_API_KEY');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

module.exports = { config, validateConfig };
