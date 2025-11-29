/**
 * Tests for AI Features Service
 */

const { AIFeaturesService } = require('../src/services/aiFeatures');

// Mock node-fetch
jest.mock('node-fetch');
const fetch = require('node-fetch');

// Mock config
jest.mock('../src/utils/config', () => ({
  config: {
    ai: {
      enabled: true,
      serviceUrl: 'https://ai.test.com'
    }
  }
}));

describe('AIFeaturesService', () => {
  let service;

  beforeEach(() => {
    service = new AIFeaturesService();
    service.isEnabled = true;
    service.serviceUrl = 'https://ai.test.com';
    service.clearCache();
    fetch.mockReset();
  });

  describe('checkAvailability', () => {
    it('should return ready when enabled and configured', () => {
      const availability = service.checkAvailability();

      expect(availability).toEqual({
        enabled: true,
        configured: true,
        ready: true
      });
    });

    it('should return not ready when disabled', () => {
      service.isEnabled = false;
      const availability = service.checkAvailability();

      expect(availability.ready).toBe(false);
    });

    it('should return not ready when service URL not configured', () => {
      service.serviceUrl = '';
      const availability = service.checkAvailability();

      expect(availability.configured).toBe(false);
      expect(availability.ready).toBe(false);
    });
  });

  describe('analyzePerformance', () => {
    it('should call AI service and return analysis', async () => {
      const mockAnalysis = { summary: 'Good performance' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalysis)
      });

      const result = await service.analyzePerformance({
        athleteId: '123',
        metrics: { jumpHeight: 55 }
      });

      expect(result).toEqual(mockAnalysis);
      expect(fetch).toHaveBeenCalledWith(
        'https://ai.test.com/analyze/performance',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String)
        })
      );
    });

    it('should return fallback analysis when AI is disabled', async () => {
      service.isEnabled = false;

      const result = await service.analyzePerformance({
        athleteId: '123',
        metrics: { jumpHeight: 55 }
      });

      expect(result.error).toBe('AI features are disabled');
      expect(result.fallback).toBeDefined();
    });

    it('should use cached results when available', async () => {
      const mockAnalysis = { summary: 'Cached analysis' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalysis)
      });

      const performanceData = { athleteId: '123', metrics: {} };

      // First call - should hit API
      await service.analyzePerformance(performanceData);
      
      // Second call - should use cache
      const result = await service.analyzePerformance(performanceData);

      expect(result.fromCache).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations from AI service', async () => {
      const mockRecs = { recommendations: ['Train harder'] };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecs)
      });

      const result = await service.generateRecommendations({
        athleteId: '123'
      });

      expect(result).toEqual(mockRecs);
    });

    it('should return fallback recommendations when disabled', async () => {
      service.isEnabled = false;

      const result = await service.generateRecommendations({
        athleteId: '123'
      });

      expect(result.fallback.recommendations).toBeDefined();
      expect(result.fallback.recommendations).toHaveLength(3);
    });
  });

  describe('assessInjuryRisk', () => {
    it('should assess risk from AI service', async () => {
      const mockAssessment = { riskLevel: 'low' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAssessment)
      });

      const result = await service.assessInjuryRisk({
        athleteId: '123',
        loadHistory: [50, 60, 70]
      });

      expect(result).toEqual(mockAssessment);
    });

    it('should return fallback assessment when disabled', async () => {
      service.isEnabled = false;

      const result = await service.assessInjuryRisk({
        athleteId: '123',
        loadHistory: []
      });

      expect(result.fallback.riskLevel).toBeDefined();
    });
  });

  describe('generateBasicAnalysis', () => {
    it('should generate insights for jump height', () => {
      const analysis = service.generateBasicAnalysis({
        athleteId: '123',
        metrics: { jumpHeight: 55 }
      });

      expect(analysis.insights).toContainEqual(
        expect.objectContaining({
          metric: 'jumpHeight',
          value: 55
        })
      );
    });

    it('should include timestamp and athleteId', () => {
      const analysis = service.generateBasicAnalysis({
        athleteId: '123',
        metrics: {}
      });

      expect(analysis.athleteId).toBe('123');
      expect(analysis.timestamp).toBeDefined();
    });
  });

  describe('generateBasicRiskAssessment', () => {
    it('should assess high risk for high load', () => {
      const assessment = service.generateBasicRiskAssessment({
        athleteId: '123',
        loadHistory: [85, 90, 85, 88]
      });

      expect(assessment.riskLevel).toBe('high');
      expect(assessment.riskFactors).toContain('High training load detected');
    });

    it('should assess moderate risk for moderate load', () => {
      const assessment = service.generateBasicRiskAssessment({
        athleteId: '123',
        loadHistory: [65, 70, 65]
      });

      expect(assessment.riskLevel).toBe('moderate');
    });

    it('should assess low risk for low load', () => {
      const assessment = service.generateBasicRiskAssessment({
        athleteId: '123',
        loadHistory: [40, 50, 45]
      });

      expect(assessment.riskLevel).toBe('low');
    });
  });

  describe('cache operations', () => {
    it('should clear cache', () => {
      service.setCache('test-key', { data: 'test' });
      expect(service.analysisCache.size).toBe(1);

      service.clearCache();

      expect(service.analysisCache.size).toBe(0);
    });

    it('should expire cached data', () => {
      service.cacheExpiryMs = 100;
      service.setCache('test-key', { data: 'test' });

      // Fast-forward time
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 200);

      const cached = service.getFromCache('test-key');
      
      Date.now = originalNow;

      expect(cached).toBeNull();
    });
  });

  describe('getStatus', () => {
    it('should return correct status', () => {
      const status = service.getStatus();

      expect(status).toEqual({
        enabled: true,
        serviceUrl: 'configured',
        cacheSize: 0
      });
    });
  });
});
