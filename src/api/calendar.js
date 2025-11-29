/**
 * Calendar API Routes
 * Handles calendar events and synchronization
 */

const express = require('express');
const router = express.Router();
const { calendarSyncService } = require('../services/calendarSync');

/**
 * GET /api/calendar/status
 * Get the current sync status
 */
router.get('/status', (req, res) => {
  const status = calendarSyncService.getSyncStatus();
  res.json(status);
});

/**
 * POST /api/calendar/sync/start
 * Start the calendar sync service
 */
router.post('/sync/start', (req, res) => {
  const result = calendarSyncService.startSync();
  res.json(result);
});

/**
 * POST /api/calendar/sync/stop
 * Stop the calendar sync service
 */
router.post('/sync/stop', (req, res) => {
  const result = calendarSyncService.stopSync();
  res.json(result);
});

/**
 * POST /api/calendar/sync/trigger
 * Manually trigger a sync
 */
router.post('/sync/trigger', async (req, res) => {
  try {
    const result = await calendarSyncService.performSync();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/calendar/events
 * Get all events with optional filtering
 */
router.get('/events', (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    athleteId: req.query.athleteId,
    teamId: req.query.teamId,
    type: req.query.type,
  };

  // Remove undefined filters
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  const events = calendarSyncService.getEvents(filters);
  res.json({ events, count: events.length });
});

/**
 * GET /api/calendar/events/today
 * Get today's events
 */
router.get('/events/today', (req, res) => {
  const events = calendarSyncService.getTodayEvents();
  res.json({ events, count: events.length });
});

/**
 * GET /api/calendar/events/:id
 * Get a specific event
 */
router.get('/events/:id', (req, res) => {
  const event = calendarSyncService.getEvent(req.params.id);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json(event);
});

/**
 * POST /api/calendar/events
 * Create a new event
 */
router.post('/events', (req, res) => {
  const { title, description, startTime, endTime, athleteId, teamId, type, location, notes } = req.body;

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ 
      error: 'Title, startTime, and endTime are required' 
    });
  }

  try {
    const event = calendarSyncService.addEvent({
      title,
      description,
      startTime,
      endTime,
      athleteId,
      teamId,
      type,
      location,
      notes,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/calendar/events/:id
 * Update an existing event
 */
router.put('/events/:id', (req, res) => {
  const { title, description, startTime, endTime, athleteId, teamId, type, location, notes } = req.body;

  try {
    const event = calendarSyncService.updateEvent(req.params.id, {
      title,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      athleteId,
      teamId,
      type,
      location,
      notes,
    });

    res.json(event);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/calendar/events/:id
 * Delete an event
 */
router.delete('/events/:id', (req, res) => {
  const deleted = calendarSyncService.deleteEvent(req.params.id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json({ success: true, message: 'Event deleted' });
});

module.exports = router;
