/**
 * Calendar Sync Service
 * Handles live synchronization of daily activities and schedules
 */

const { v4: uuidv4 } = require('uuid');
const { config } = require('../utils/config');

class CalendarSyncService {
  constructor() {
    this.events = new Map();
    this.syncInterval = null;
    this.lastSyncTime = null;
    this.listeners = [];
    this.isSyncing = false;
  }

  /**
   * Starts the calendar sync service
   */
  startSync() {
    if (this.syncInterval) {
      return { status: 'already_running' };
    }

    if (!config.calendar.syncEnabled) {
      return { status: 'disabled', message: 'Calendar sync is disabled in configuration' };
    }

    this.syncInterval = setInterval(() => {
      this.performSync();
    }, config.calendar.syncIntervalMs);

    // Perform initial sync
    this.performSync();

    return { status: 'started', intervalMs: config.calendar.syncIntervalMs };
  }

  /**
   * Stops the calendar sync service
   */
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      return { status: 'stopped' };
    }
    return { status: 'not_running' };
  }

  /**
   * Performs a sync operation
   */
  async performSync() {
    if (this.isSyncing) {
      return { status: 'sync_in_progress' };
    }

    this.isSyncing = true;
    
    try {
      // Notify listeners of sync start
      this.notifyListeners({ type: 'sync_start', timestamp: new Date() });

      // In a real implementation, this would sync with external calendar services
      // For now, we simulate the sync process
      this.lastSyncTime = new Date();

      // Notify listeners of sync completion
      this.notifyListeners({ 
        type: 'sync_complete', 
        timestamp: this.lastSyncTime,
        eventCount: this.events.size 
      });

      return { 
        status: 'success', 
        syncTime: this.lastSyncTime,
        eventCount: this.events.size 
      };
    } catch (error) {
      this.notifyListeners({ 
        type: 'sync_error', 
        error: error.message,
        timestamp: new Date() 
      });
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Adds an event to the calendar
   * @param {Object} eventData - Event data
   * @returns {Object} Created event
   */
  addEvent(eventData) {
    const event = {
      id: uuidv4(),
      title: eventData.title,
      description: eventData.description || '',
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      athleteId: eventData.athleteId || null,
      teamId: eventData.teamId || null,
      type: eventData.type || 'general', // training, competition, recovery, meeting, general
      location: eventData.location || '',
      notes: eventData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
    };

    this.events.set(event.id, event);
    this.notifyListeners({ type: 'event_added', event });
    
    return event;
  }

  /**
   * Updates an existing event
   * @param {string} eventId - Event ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated event
   */
  updateEvent(eventId, updates) {
    const event = this.events.get(eventId);
    
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    const updatedEvent = {
      ...event,
      ...updates,
      id: event.id, // Prevent ID changes
      createdAt: event.createdAt, // Preserve creation time
      updatedAt: new Date(),
      synced: false,
    };

    this.events.set(eventId, updatedEvent);
    this.notifyListeners({ type: 'event_updated', event: updatedEvent });
    
    return updatedEvent;
  }

  /**
   * Deletes an event
   * @param {string} eventId - Event ID
   * @returns {boolean} Success status
   */
  deleteEvent(eventId) {
    const deleted = this.events.delete(eventId);
    
    if (deleted) {
      this.notifyListeners({ type: 'event_deleted', eventId });
    }
    
    return deleted;
  }

  /**
   * Gets an event by ID
   * @param {string} eventId - Event ID
   * @returns {Object|null} Event or null
   */
  getEvent(eventId) {
    return this.events.get(eventId) || null;
  }

  /**
   * Gets all events, optionally filtered
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of events
   */
  getEvents(filters = {}) {
    let events = Array.from(this.events.values());

    if (filters.startDate) {
      events = events.filter(e => e.startTime >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      events = events.filter(e => e.endTime <= new Date(filters.endDate));
    }

    if (filters.athleteId) {
      events = events.filter(e => e.athleteId === filters.athleteId);
    }

    if (filters.teamId) {
      events = events.filter(e => e.teamId === filters.teamId);
    }

    if (filters.type) {
      events = events.filter(e => e.type === filters.type);
    }

    // Sort by start time
    events.sort((a, b) => a.startTime - b.startTime);

    return events;
  }

  /**
   * Gets events for today
   * @returns {Array} Today's events
   */
  getTodayEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getEvents({
      startDate: today,
      endDate: tomorrow,
    });
  }

  /**
   * Adds a listener for calendar events
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifies all listeners of an event
   * @param {Object} event - Event data
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Calendar listener error:', error);
      }
    });
  }

  /**
   * Gets the sync status
   * @returns {Object} Sync status
   */
  getSyncStatus() {
    return {
      enabled: config.calendar.syncEnabled,
      running: !!this.syncInterval,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      eventCount: this.events.size,
      intervalMs: config.calendar.syncIntervalMs,
    };
  }
}

// Singleton instance
const calendarSyncService = new CalendarSyncService();

module.exports = { CalendarSyncService, calendarSyncService };
