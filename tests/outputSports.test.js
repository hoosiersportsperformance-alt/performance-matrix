/**
 * Tests for Output Sports Service
 */

const { OutputSportsService } = require('../src/services/outputSports');

// Mock node-fetch
jest.mock('node-fetch');
const fetch = require('node-fetch');

describe('OutputSportsService', () => {
  let service;

  beforeEach(() => {
    service = new OutputSportsService('test-api-key', 'https://api.test.com');
    fetch.mockReset();
  });

  describe('constructor', () => {
    it('should initialize with provided values', () => {
      expect(service.apiKey).toBe('test-api-key');
      expect(service.apiUrl).toBe('https://api.test.com');
      expect(service.isConnected).toBe(false);
    });

    it('should handle missing API key', () => {
      const noKeyService = new OutputSportsService(null, 'https://api.test.com');
      expect(noKeyService.apiKey).toBeFalsy();
    });
  });

  describe('validateApiKey', () => {
    it('should return invalid when no API key is configured', async () => {
      service.apiKey = '';
      const result = await service.validateApiKey();
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is not configured');
    });

    it('should return valid when API responds OK', async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      
      const result = await service.validateApiKey();
      
      expect(result.valid).toBe(true);
      expect(service.isConnected).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/auth/validate',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
    });

    it('should return invalid when API returns error status', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 401 });
      
      const result = await service.validateApiKey();
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('401');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await service.validateApiKey();
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getAthleteData', () => {
    it('should throw error when API key is not configured', async () => {
      service.apiKey = '';
      
      await expect(service.getAthleteData()).rejects.toThrow('API key is required');
    });

    it('should fetch all athletes when no ID provided', async () => {
      const mockData = { athletes: [{ id: '1', name: 'Test' }] };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const result = await service.getAthleteData();
      
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/athletes',
        expect.any(Object)
      );
    });

    it('should fetch specific athlete when ID provided', async () => {
      const mockData = { id: '123', name: 'Test Athlete' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const result = await service.getAthleteData('123');
      
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/athletes/123',
        expect.any(Object)
      );
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should fetch metrics for athlete', async () => {
      const mockData = { metrics: { jumpHeight: 55 } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const result = await service.getPerformanceMetrics('123', 'jump');
      
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/athletes/123/metrics?type=jump',
        expect.any(Object)
      );
    });

    it('should fetch all metrics when type is "all"', async () => {
      const mockData = { metrics: {} };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const result = await service.getPerformanceMetrics('123', 'all');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/athletes/123/metrics',
        expect.any(Object)
      );
    });
  });

  describe('getConnectionStatus', () => {
    it('should return correct status', () => {
      const status = service.getConnectionStatus();
      
      expect(status).toEqual({
        connected: false,
        lastSync: null,
        apiConfigured: true
      });
    });
  });

  describe('setApiKey', () => {
    it('should update API key and reset connection state', () => {
      service.isConnected = true;
      service.lastSyncTime = new Date();
      
      service.setApiKey('new-key');
      
      expect(service.apiKey).toBe('new-key');
      expect(service.isConnected).toBe(false);
      expect(service.lastSyncTime).toBeNull();
    });
  });
});
