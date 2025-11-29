import { useEffect, useState } from "react";
import { fetchTodayAthletics, AthleticEvent } from "../api/calendarApi";

export function useTodayAthletics() {
  const [events, setEvents] = useState<AthleticEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTodayAthletics();
        if (isMounted) {
          setEvents(data);
        }
      } catch (err: any) {
        console.error("Failed to load today athletics", err);
        if (isMounted) {
          // You can customize this error message
          setError("Unable to load today’s athletics schedule.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, loading, error };
}