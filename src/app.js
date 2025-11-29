/**
 * Performance Matrix - Athlete Management System
 * Main application entry point
 */

const express = require('express');
const cors = require('cors');
const { config, validateConfig } = require('./utils/config');

// Import routes
const outputSportsRoutes = require('./api/outputSports');
const calendarRoutes = require('./api/calendar');
const aiFeaturesRoutes = require('./api/aiFeatures');

// Import services
const { calendarSyncService } = require('./services/calendarSync');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/output-sports', outputSportsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ai', aiFeaturesRoutes);

// System status endpoint
app.get('/api/status', (req, res) => {
  const configValidation = validateConfig();
  const calendarStatus = calendarSyncService.getSyncStatus();
  
  res.json({
    system: 'Performance Matrix',
    version: '1.0.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    config: {
      outputSportsConfigured: !!config.outputSports.apiKey,
      calendarEnabled: config.calendar.syncEnabled,
      aiEnabled: config.ai.enabled,
    },
    services: {
      calendar: calendarStatus,
    },
    validation: configValidation,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.server.nodeEnv === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Start the server
 */
function startServer() {
  const port = config.server.port;
  
  const server = app.listen(port, () => {
    console.log(`Performance Matrix server running on port ${port}`);
    console.log(`Environment: ${config.server.nodeEnv}`);
    
    // Validate configuration on startup
    const validation = validateConfig();
    if (!validation.isValid) {
      console.warn('Configuration warnings:');
      validation.missing.forEach(item => {
        console.warn(`  - Missing: ${item}`);
      });
    }

    // Auto-start calendar sync if enabled
    if (config.calendar.syncEnabled) {
      const syncResult = calendarSyncService.startSync();
      console.log(`Calendar sync: ${syncResult.status}`);
    }
  });

  return server;
}

// Export for testing
module.exports = { app, startServer };

// Start server if this is the main module
if (require.main === module) {
  startServer();
}
