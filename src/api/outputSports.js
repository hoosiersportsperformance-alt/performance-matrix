/**
 * Output Sports API Routes
 * Handles API key configuration and data retrieval from Output Sports
 */

const express = require('express');
const router = express.Router();
const { outputSportsService } = require('../services/outputSports');
const { config } = require('../utils/config');

/**
 * GET /api/output-sports/status
 * Get the current connection status
 */
router.get('/status', (req, res) => {
  const status = outputSportsService.getConnectionStatus();
  res.json(status);
});

/**
 * POST /api/output-sports/configure
 * Configure the Output Sports API key
 */
router.post('/configure', async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ 
      error: 'API key is required and must be a string' 
    });
  }

  // Set the new API key
  outputSportsService.setApiKey(apiKey);

  // Validate the API key
  const validation = await outputSportsService.validateApiKey();
  
  if (validation.valid) {
    res.json({ 
      success: true, 
      message: 'API key configured and validated successfully' 
    });
  } else {
    res.status(400).json({ 
      success: false, 
      error: validation.error || 'API key validation failed'
    });
  }
});

/**
 * POST /api/output-sports/validate
 * Validate the currently configured API key
 */
router.post('/validate', async (req, res) => {
  const validation = await outputSportsService.validateApiKey();
  res.json(validation);
});

/**
 * GET /api/output-sports/athletes
 * Get all athletes
 */
router.get('/athletes', async (req, res) => {
  try {
    const data = await outputSportsService.getAthleteData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/output-sports/athletes/:id
 * Get a specific athlete
 */
router.get('/athletes/:id', async (req, res) => {
  try {
    const data = await outputSportsService.getAthleteData(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/output-sports/athletes/:id/metrics
 * Get performance metrics for an athlete
 */
router.get('/athletes/:id/metrics', async (req, res) => {
  try {
    const metricType = req.query.type || 'all';
    const data = await outputSportsService.getPerformanceMetrics(req.params.id, metricType);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/output-sports/teams
 * Get all teams
 */
router.get('/teams', async (req, res) => {
  try {
    const data = await outputSportsService.getTeamData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/output-sports/teams/:id
 * Get a specific team
 */
router.get('/teams/:id', async (req, res) => {
  try {
    const data = await outputSportsService.getTeamData(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
