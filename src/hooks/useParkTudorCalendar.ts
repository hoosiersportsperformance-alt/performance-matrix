import { useState, useEffect } from 'react';
import { fetchAndParseCalendar, sortEventsByLevel, ParsedEvent } from '../services/calendarApi';

export const useParkTudorCalendar = () => {
  const [todaysEvents, setTodaysEvents] = useState<ParsedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const allEvents = await fetchAndParseCalendar();
        
        // Filter for TODAY only
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const filtered = allEvents.filter(evt => {
          return evt.start >= startOfDay && evt.start < endOfDay;
        });

        // Sort by Priority (Varsity > JV > MS)
        const sorted = sortEventsByLevel(filtered);

        setTodaysEvents(sorted);
      } catch (err) {
        console.error(err);
        setError("Failed to load calendar events.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return { todaysEvents, loading, error };
};