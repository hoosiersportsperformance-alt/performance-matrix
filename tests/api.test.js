/**
 * API Integration Tests
 */

const request = require('supertest');
const { app } = require('../src/app');

// Mock the services
jest.mock('../src/services/outputSports', () => {
  const mockService = {
    getConnectionStatus: jest.fn().mockReturnValue({
      connected: false,
      lastSync: null,
      apiConfigured: true
    }),
    setApiKey: jest.fn(),
    validateApiKey: jest.fn().mockResolvedValue({ valid: true }),
    getAthleteData: jest.fn().mockResolvedValue({ athletes: [] }),
    getPerformanceMetrics: jest.fn().mockResolvedValue({ metrics: {} }),
    getTeamData: jest.fn().mockResolvedValue({ teams: [] })
  };
  return {
    outputSportsService: mockService,
    OutputSportsService: jest.fn(() => mockService)
  };
});

jest.mock('../src/services/calendarSync', () => {
  const mockService = {
    getSyncStatus: jest.fn().mockReturnValue({
      enabled: true,
      running: false,
      eventCount: 0
    }),
    startSync: jest.fn().mockReturnValue({ status: 'started' }),
    stopSync: jest.fn().mockReturnValue({ status: 'stopped' }),
    performSync: jest.fn().mockResolvedValue({ status: 'success' }),
    getEvents: jest.fn().mockReturnValue([]),
    getTodayEvents: jest.fn().mockReturnValue([]),
    getEvent: jest.fn(),
    addEvent: jest.fn().mockImplementation(data => ({
      id: 'test-id',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    })),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn()
  };
  return {
    calendarSyncService: mockService,
    CalendarSyncService: jest.fn(() => mockService)
  };
});

jest.mock('../src/services/aiFeatures', () => {
  const mockService = {
    getStatus: jest.fn().mockReturnValue({
      enabled: true,
      serviceUrl: 'configured'
    }),
    checkAvailability: jest.fn().mockReturnValue({
      enabled: true,
      configured: true,
      ready: true
    }),
    analyzePerformance: jest.fn().mockResolvedValue({ analysis: 'test' }),
    generateRecommendations: jest.fn().mockResolvedValue({ recommendations: [] }),
    assessInjuryRisk: jest.fn().mockResolvedValue({ riskLevel: 'low' }),
    clearCache: jest.fn()
  };
  return {
    aiFeaturesService: mockService,
    AIFeaturesService: jest.fn(() => mockService)
  };
});

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('GET /health should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('System Status', () => {
    it('GET /api/status should return system status', async () => {
      const response = await request(app).get('/api/status');

      expect(response.status).toBe(200);
      expect(response.body.system).toBe('Performance Matrix');
      expect(response.body.config).toBeDefined();
    });
  });

  describe('Output Sports API', () => {
    it('GET /api/output-sports/status should return connection status', async () => {
      const response = await request(app).get('/api/output-sports/status');

      expect(response.status).toBe(200);
      expect(response.body.apiConfigured).toBeDefined();
    });

    it('POST /api/output-sports/configure should require API key', async () => {
      const response = await request(app)
        .post('/api/output-sports/configure')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('API key is required');
    });

    it('POST /api/output-sports/configure should accept valid API key', async () => {
      const response = await request(app)
        .post('/api/output-sports/configure')
        .send({ apiKey: 'test-api-key' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('GET /api/output-sports/athletes should return athletes', async () => {
      const response = await request(app).get('/api/output-sports/athletes');

      expect(response.status).toBe(200);
      expect(response.body.athletes).toBeDefined();
    });
  });

  describe('Calendar API', () => {
    it('GET /api/calendar/status should return sync status', async () => {
      const response = await request(app).get('/api/calendar/status');

      expect(response.status).toBe(200);
      expect(response.body.enabled).toBeDefined();
    });

    it('POST /api/calendar/sync/start should start sync', async () => {
      const response = await request(app).post('/api/calendar/sync/start');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('started');
    });

    it('POST /api/calendar/sync/stop should stop sync', async () => {
      const response = await request(app).post('/api/calendar/sync/stop');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('stopped');
    });

    it('GET /api/calendar/events should return events', async () => {
      const response = await request(app).get('/api/calendar/events');

      expect(response.status).toBe(200);
      expect(response.body.events).toBeDefined();
    });

    it('GET /api/calendar/events/today should return today events', async () => {
      const response = await request(app).get('/api/calendar/events/today');

      expect(response.status).toBe(200);
      expect(response.body.events).toBeDefined();
    });

    it('POST /api/calendar/events should require title and times', async () => {
      const response = await request(app)
        .post('/api/calendar/events')
        .send({ title: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('POST /api/calendar/events should create event', async () => {
      const response = await request(app)
        .post('/api/calendar/events')
        .send({
          title: 'Training',
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T10:00:00Z'
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    });
  });

  describe('AI Features API', () => {
    it('GET /api/ai/status should return AI status', async () => {
      const response = await request(app).get('/api/ai/status');

      expect(response.status).toBe(200);
      expect(response.body.enabled).toBeDefined();
    });

    it('POST /api/ai/analyze/performance should require athleteId', async () => {
      const response = await request(app)
        .post('/api/ai/analyze/performance')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('athleteId');
    });

    it('POST /api/ai/analyze/performance should return analysis', async () => {
      const response = await request(app)
        .post('/api/ai/analyze/performance')
        .send({ athleteId: '123' });

      expect(response.status).toBe(200);
    });

    it('POST /api/ai/recommendations should return recommendations', async () => {
      const response = await request(app)
        .post('/api/ai/recommendations')
        .send({ athleteId: '123' });

      expect(response.status).toBe(200);
    });

    it('POST /api/ai/risk-assessment should return assessment', async () => {
      const response = await request(app)
        .post('/api/ai/risk-assessment')
        .send({ athleteId: '123' });

      expect(response.status).toBe(200);
    });

    it('POST /api/ai/cache/clear should clear cache', async () => {
      const response = await request(app).post('/api/ai/cache/clear');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown/route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });
  });
});
