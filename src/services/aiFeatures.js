/**
 * AI Features Service
 * Handles AI-powered analytics and insights for athlete performance
 */

const fetch = require('node-fetch');
const { config } = require('../utils/config');

class AIFeaturesService {
  constructor() {
    this.isEnabled = config.ai.enabled;
    this.serviceUrl = config.ai.serviceUrl;
    this.analysisCache = new Map();
    this.cacheExpiryMs = 300000; // 5 minutes
  }

  /**
   * Checks if AI features are available
   * @returns {Object} Availability status
   */
  checkAvailability() {
    return {
      enabled: this.isEnabled,
      configured: !!this.serviceUrl,
      ready: this.isEnabled && !!this.serviceUrl,
    };
  }

  /**
   * Analyzes athlete performance data
   * @param {Object} performanceData - Performance metrics
   * @returns {Promise<Object>} Analysis results
   */
  async analyzePerformance(performanceData) {
    if (!this.isEnabled) {
      return { 
        error: 'AI features are disabled',
        fallback: this.generateBasicAnalysis(performanceData)
      };
    }

    const cacheKey = this.generateCacheKey('performance', performanceData);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      if (this.serviceUrl) {
        const response = await fetch(`${this.serviceUrl}/analyze/performance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(performanceData),
        });

        if (response.ok) {
          const result = await response.json();
          this.setCache(cacheKey, result);
          return result;
        }
      }

      // Fallback to basic analysis
      const basicAnalysis = this.generateBasicAnalysis(performanceData);
      this.setCache(cacheKey, basicAnalysis);
      return basicAnalysis;
    } catch (error) {
      // On error, provide basic analysis
      return {
        error: error.message,
        fallback: this.generateBasicAnalysis(performanceData)
      };
    }
  }

  /**
   * Generates training recommendations
   * @param {Object} athleteProfile - Athlete profile and history
   * @returns {Promise<Object>} Training recommendations
   */
  async generateRecommendations(athleteProfile) {
    if (!this.isEnabled) {
      return {
        error: 'AI features are disabled',
        fallback: this.generateBasicRecommendations(athleteProfile)
      };
    }

    const cacheKey = this.generateCacheKey('recommendations', athleteProfile);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      if (this.serviceUrl) {
        const response = await fetch(`${this.serviceUrl}/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(athleteProfile),
        });

        if (response.ok) {
          const result = await response.json();
          this.setCache(cacheKey, result);
          return result;
        }
      }

      // Fallback to basic recommendations
      const basicRecs = this.generateBasicRecommendations(athleteProfile);
      this.setCache(cacheKey, basicRecs);
      return basicRecs;
    } catch (error) {
      return {
        error: error.message,
        fallback: this.generateBasicRecommendations(athleteProfile)
      };
    }
  }

  /**
   * Predicts injury risk based on training load
   * @param {Object} trainingData - Recent training data
   * @returns {Promise<Object>} Risk assessment
   */
  async assessInjuryRisk(trainingData) {
    if (!this.isEnabled) {
      return {
        error: 'AI features are disabled',
        fallback: this.generateBasicRiskAssessment(trainingData)
      };
    }

    try {
      if (this.serviceUrl) {
        const response = await fetch(`${this.serviceUrl}/risk-assessment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trainingData),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      return this.generateBasicRiskAssessment(trainingData);
    } catch (error) {
      return {
        error: error.message,
        fallback: this.generateBasicRiskAssessment(trainingData)
      };
    }
  }

  /**
   * Generates basic performance analysis (fallback)
   * @param {Object} data - Performance data
   * @returns {Object} Basic analysis
   */
  generateBasicAnalysis(data) {
    const metrics = data.metrics || {};
    const trends = [];
    const insights = [];

    // Analyze available metrics
    if (metrics.jumpHeight) {
      insights.push({
        metric: 'jumpHeight',
        value: metrics.jumpHeight,
        insight: metrics.jumpHeight > 50 ? 'Above average jump height' : 'Consider plyometric training',
      });
    }

    if (metrics.sprintTime) {
      insights.push({
        metric: 'sprintTime',
        value: metrics.sprintTime,
        insight: 'Sprint performance tracked',
      });
    }

    if (metrics.strength) {
      insights.push({
        metric: 'strength',
        value: metrics.strength,
        insight: 'Strength metrics recorded',
      });
    }

    return {
      timestamp: new Date(),
      athleteId: data.athleteId,
      summary: 'Basic performance analysis completed',
      insights,
      trends,
      recommendations: ['Continue monitoring performance metrics'],
    };
  }

  /**
   * Generates basic training recommendations (fallback)
   * @param {Object} profile - Athlete profile
   * @returns {Object} Basic recommendations
   */
  generateBasicRecommendations(profile) {
    const recommendations = [
      {
        category: 'recovery',
        title: 'Maintain proper recovery',
        description: 'Ensure adequate sleep and nutrition between training sessions',
        priority: 'high',
      },
      {
        category: 'training',
        title: 'Progressive overload',
        description: 'Gradually increase training intensity over time',
        priority: 'medium',
      },
      {
        category: 'monitoring',
        title: 'Track performance metrics',
        description: 'Regular assessment helps identify trends and areas for improvement',
        priority: 'medium',
      },
    ];

    return {
      timestamp: new Date(),
      athleteId: profile.athleteId,
      recommendations,
      nextAssessmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    };
  }

  /**
   * Generates basic risk assessment (fallback)
   * @param {Object} trainingData - Training data
   * @returns {Object} Basic risk assessment
   */
  generateBasicRiskAssessment(trainingData) {
    const loadHistory = trainingData.loadHistory || [];
    const avgLoad = loadHistory.length > 0 
      ? loadHistory.reduce((sum, l) => sum + l, 0) / loadHistory.length 
      : 0;

    let riskLevel = 'low';
    let riskFactors = [];

    if (avgLoad > 80) {
      riskLevel = 'high';
      riskFactors.push('High training load detected');
    } else if (avgLoad > 60) {
      riskLevel = 'moderate';
      riskFactors.push('Moderate training load - monitor closely');
    }

    return {
      timestamp: new Date(),
      athleteId: trainingData.athleteId,
      riskLevel,
      riskScore: avgLoad,
      riskFactors,
      recommendations: riskLevel === 'high' 
        ? ['Consider reducing training volume', 'Increase recovery time']
        : ['Continue current training plan'],
    };
  }

  /**
   * Generates a cache key for data
   * @param {string} type - Analysis type
   * @param {Object} data - Data to hash
   * @returns {string} Cache key
   */
  generateCacheKey(type, data) {
    return `${type}_${JSON.stringify(data).substring(0, 100)}`;
  }

  /**
   * Gets data from cache if not expired
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null
   */
  getFromCache(key) {
    const cached = this.analysisCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiryMs) {
      return cached.data;
    }
    return null;
  }

  /**
   * Sets data in cache
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCache(key, data) {
    this.analysisCache.set(key, {
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Clears the analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
  }

  /**
   * Gets the service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      serviceUrl: this.serviceUrl ? 'configured' : 'not_configured',
      cacheSize: this.analysisCache.size,
    };
  }
}

// Singleton instance
const aiFeaturesService = new AIFeaturesService();

module.exports = { AIFeaturesService, aiFeaturesService };
