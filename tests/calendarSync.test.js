/**
 * Tests for Calendar Sync Service
 */

const { CalendarSyncService } = require('../src/services/calendarSync');

// Mock config
jest.mock('../src/utils/config', () => ({
  config: {
    calendar: {
      syncEnabled: true,
      syncIntervalMs: 1000
    }
  }
}));

describe('CalendarSyncService', () => {
  let service;

  beforeEach(() => {
    service = new CalendarSyncService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    service.stopSync();
    jest.useRealTimers();
  });

  describe('addEvent', () => {
    it('should create a new event with all properties', () => {
      const eventData = {
        title: 'Training Session',
        description: 'Morning workout',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T10:00:00Z',
        athleteId: 'athlete-123',
        type: 'training',
        location: 'Main Gym'
      };

      const event = service.addEvent(eventData);

      expect(event.id).toBeDefined();
      expect(event.title).toBe('Training Session');
      expect(event.description).toBe('Morning workout');
      expect(event.athleteId).toBe('athlete-123');
      expect(event.type).toBe('training');
      expect(event.location).toBe('Main Gym');
      expect(event.synced).toBe(false);
    });

    it('should generate unique IDs for events', () => {
      const event1 = service.addEvent({ title: 'Event 1', startTime: new Date(), endTime: new Date() });
      const event2 = service.addEvent({ title: 'Event 2', startTime: new Date(), endTime: new Date() });

      expect(event1.id).not.toBe(event2.id);
    });

    it('should set default type to "general"', () => {
      const event = service.addEvent({ title: 'Test', startTime: new Date(), endTime: new Date() });
      expect(event.type).toBe('general');
    });
  });

  describe('getEvent', () => {
    it('should return event by ID', () => {
      const created = service.addEvent({ title: 'Test', startTime: new Date(), endTime: new Date() });
      const retrieved = service.getEvent(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent event', () => {
      const result = service.getEvent('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('updateEvent', () => {
    it('should update event properties', () => {
      const event = service.addEvent({ title: 'Original', startTime: new Date(), endTime: new Date() });
      
      const updated = service.updateEvent(event.id, { title: 'Updated' });

      expect(updated.title).toBe('Updated');
      expect(updated.id).toBe(event.id);
      expect(updated.synced).toBe(false);
    });

    it('should throw error for non-existent event', () => {
      expect(() => {
        service.updateEvent('non-existent', { title: 'Test' });
      }).toThrow('Event not found');
    });

    it('should preserve original ID and creation time', () => {
      const event = service.addEvent({ title: 'Test', startTime: new Date(), endTime: new Date() });
      const originalCreatedAt = event.createdAt;

      const updated = service.updateEvent(event.id, { 
        id: 'new-id', 
        createdAt: new Date()
      });

      expect(updated.id).toBe(event.id);
      expect(updated.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe('deleteEvent', () => {
    it('should delete existing event', () => {
      const event = service.addEvent({ title: 'Test', startTime: new Date(), endTime: new Date() });
      
      const result = service.deleteEvent(event.id);

      expect(result).toBe(true);
      expect(service.getEvent(event.id)).toBeNull();
    });

    it('should return false for non-existent event', () => {
      const result = service.deleteEvent('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getEvents', () => {
    it('should return all events sorted by start time', () => {
      const later = new Date('2024-01-15T10:00:00Z');
      const earlier = new Date('2024-01-15T08:00:00Z');
      
      service.addEvent({ title: 'Later', startTime: later, endTime: later });
      service.addEvent({ title: 'Earlier', startTime: earlier, endTime: earlier });

      const events = service.getEvents();

      expect(events).toHaveLength(2);
      expect(events[0].title).toBe('Earlier');
      expect(events[1].title).toBe('Later');
    });

    it('should filter by athleteId', () => {
      service.addEvent({ title: 'A1', startTime: new Date(), endTime: new Date(), athleteId: 'a1' });
      service.addEvent({ title: 'A2', startTime: new Date(), endTime: new Date(), athleteId: 'a2' });

      const events = service.getEvents({ athleteId: 'a1' });

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('A1');
    });

    it('should filter by type', () => {
      service.addEvent({ title: 'Training', startTime: new Date(), endTime: new Date(), type: 'training' });
      service.addEvent({ title: 'Meeting', startTime: new Date(), endTime: new Date(), type: 'meeting' });

      const events = service.getEvents({ type: 'training' });

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Training');
    });
  });

  describe('startSync/stopSync', () => {
    it('should start and stop sync interval', () => {
      const startResult = service.startSync();
      expect(startResult.status).toBe('started');

      const stopResult = service.stopSync();
      expect(stopResult.status).toBe('stopped');
    });

    it('should return already_running if started twice', () => {
      service.startSync();
      const result = service.startSync();
      expect(result.status).toBe('already_running');
    });

    it('should return not_running if stopped without starting', () => {
      const result = service.stopSync();
      expect(result.status).toBe('not_running');
    });
  });

  describe('getSyncStatus', () => {
    it('should return correct status', () => {
      const status = service.getSyncStatus();

      expect(status).toEqual({
        enabled: true,
        running: false,
        isSyncing: false,
        lastSyncTime: null,
        eventCount: 0,
        intervalMs: 1000
      });
    });
  });

  describe('listeners', () => {
    it('should notify listeners when events are added', () => {
      const listener = jest.fn();
      service.addListener(listener);

      service.addEvent({ title: 'Test', startTime: new Date(), endTime: new Date() });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'event_added' })
      );
    });

    it('should allow unsubscribing listeners', () => {
      const listener = jest.fn();
      const unsubscribe = service.addListener(listener);

      unsubscribe();
      service.addEvent({ title: 'Test', startTime: new Date(), endTime: new Date() });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
