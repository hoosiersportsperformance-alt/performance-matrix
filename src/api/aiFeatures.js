/**
 * AI Features API Routes
 * Handles AI-powered analytics and insights
 */

const express = require('express');
const router = express.Router();
const { aiFeaturesService } = require('../services/aiFeatures');

/**
 * GET /api/ai/status
 * Get the AI features status
 */
router.get('/status', (req, res) => {
  const status = aiFeaturesService.getStatus();
  const availability = aiFeaturesService.checkAvailability();
  res.json({ ...status, ...availability });
});

/**
 * POST /api/ai/analyze/performance
 * Analyze athlete performance data
 */
router.post('/analyze/performance', async (req, res) => {
  const { athleteId, metrics, period } = req.body;

  if (!athleteId) {
    return res.status(400).json({ error: 'athleteId is required' });
  }

  try {
    const analysis = await aiFeaturesService.analyzePerformance({
      athleteId,
      metrics: metrics || {},
      period: period || 'current',
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/recommendations
 * Get AI-generated training recommendations
 */
router.post('/recommendations', async (req, res) => {
  const { athleteId, goals, history } = req.body;

  if (!athleteId) {
    return res.status(400).json({ error: 'athleteId is required' });
  }

  try {
    const recommendations = await aiFeaturesService.generateRecommendations({
      athleteId,
      goals: goals || [],
      history: history || {},
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/risk-assessment
 * Assess injury risk based on training data
 */
router.post('/risk-assessment', async (req, res) => {
  const { athleteId, loadHistory, recentInjuries } = req.body;

  if (!athleteId) {
    return res.status(400).json({ error: 'athleteId is required' });
  }

  try {
    const assessment = await aiFeaturesService.assessInjuryRisk({
      athleteId,
      loadHistory: loadHistory || [],
      recentInjuries: recentInjuries || [],
    });

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/cache/clear
 * Clear the AI analysis cache
 */
router.post('/cache/clear', (req, res) => {
  aiFeaturesService.clearCache();
  res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
