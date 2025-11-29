/**
 * Output Sports API Service
 * Handles integration with Output Sports for real-time athlete data
 */

const fetch = require('node-fetch');
const { config } = require('../utils/config');

class OutputSportsService {
  constructor(apiKey, apiUrl) {
    this.apiKey = apiKey || config.outputSports.apiKey;
    this.apiUrl = apiUrl || config.outputSports.apiUrl;
    this.isConnected = false;
    this.lastSyncTime = null;
  }

  /**
   * Validates the API key by making a test request
   * @returns {Promise<Object>} Validation result
   */
  async validateApiKey() {
    if (!this.apiKey) {
      return { 
        valid: false, 
        error: 'API key is not configured' 
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.ok) {
        this.isConnected = true;
        return { valid: true };
      }

      return { 
        valid: false, 
        error: `API returned status ${response.status}` 
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }

  /**
   * Fetches athlete data from Output Sports
   * @param {string} athleteId - Optional specific athlete ID
   * @returns {Promise<Object>} Athlete data or error
   */
  async getAthleteData(athleteId = null) {
    if (!this.apiKey) {
      throw new Error('API key is required to fetch athlete data');
    }

    const endpoint = athleteId 
      ? `${this.apiUrl}/athletes/${athleteId}` 
      : `${this.apiUrl}/athletes`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch athlete data: ${response.status}`);
      }

      const data = await response.json();
      this.lastSyncTime = new Date();
      return data;
    } catch (error) {
      throw new Error(`Error fetching athlete data: ${error.message}`);
    }
  }

  /**
   * Fetches real-time performance metrics
   * @param {string} athleteId - Athlete ID
   * @param {string} metricType - Type of metric (e.g., 'jump', 'sprint', 'strength')
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceMetrics(athleteId, metricType = 'all') {
    if (!this.apiKey) {
      throw new Error('API key is required to fetch performance metrics');
    }

    const endpoint = `${this.apiUrl}/athletes/${athleteId}/metrics`;
    const queryParams = metricType !== 'all' ? `?type=${metricType}` : '';

    try {
      const response = await fetch(`${endpoint}${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching performance metrics: ${error.message}`);
    }
  }

  /**
   * Fetches team data
   * @param {string} teamId - Optional team ID
   * @returns {Promise<Object>} Team data
   */
  async getTeamData(teamId = null) {
    if (!this.apiKey) {
      throw new Error('API key is required to fetch team data');
    }

    const endpoint = teamId 
      ? `${this.apiUrl}/teams/${teamId}` 
      : `${this.apiUrl}/teams`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch team data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching team data: ${error.message}`);
    }
  }

  /**
   * Gets the connection status
   * @returns {Object} Connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      lastSync: this.lastSyncTime,
      apiConfigured: !!this.apiKey,
    };
  }

  /**
   * Sets the API key (for runtime configuration)
   * @param {string} newApiKey - New API key
   */
  setApiKey(newApiKey) {
    this.apiKey = newApiKey;
    this.isConnected = false;
    this.lastSyncTime = null;
  }
}

// Singleton instance
const outputSportsService = new OutputSportsService();

module.exports = { OutputSportsService, outputSportsService };
