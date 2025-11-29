import React, { useEffect, useState } from "react";
import { MapPin, Clock, AlertCircle } from "lucide-react";
import { fetchTodayAthletics, AthleticEvent } from "../api/calendarApi";

interface TodayCompetitionsProps {
  currentTime: Date;
}

const PT_RED = "#C63527";

const TodayCompetitions: React.FC<TodayCompetitionsProps> = ({ currentTime }) => {
  const [events, setEvents] = useState<AthleticEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live clock formatting
  const timeString = currentTime.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchTodayAthletics();
        if (mounted) setEvents(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Could not load schedule.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Format event start time
  const formatEventTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getLevelBadgeStyles = (level: string) => {
    switch (level) {
      case "Varsity":
        return "bg-red-600 text-white border-none";
      case "JV":
        return "bg-gray-900 text-white border-none";
      case "MS":
        return "bg-white text-gray-700 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-500 border-none";
    }
  };

  return (
    <div className="h-full flex flex-col bg-black rounded-3xl p-4 border border-gray-800">
      {/* ===========================================
          HEADER (Updated to "Game Center")
      ============================================ */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col">
          <h2
            className="text-2xl font-extrabold leading-tight tracking-wide"
            style={{ color: PT_RED }}
          >
            Game Center
          </h2>
        </div>

        {/* LIVE Date + Time */}
        <div className="text-right bg-gray-900/60 rounded-lg px-2 py-1 border border-gray-700">
          <div className="text-lg font-bold text-white leading-none font-mono tracking-tight">
            {timeString}
          </div>
          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            {dateString}
          </div>
        </div>
      </div>

      {/* ===========================================
          CONTENT AREA
      ============================================ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-32 space-y-2">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400">Loading schedule...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-900/40 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-200">{error}</span>
          </div>
        )}

        {/* No Events */}
        {!loading && !error && events.length === 0 && (
          <div className="p-4 bg-neutral-900 rounded-xl border border-dashed border-gray-700 text-center mt-2">
            <span className="text-xs text-gray-500">
              No competitions scheduled for today.
            </span>
          </div>
        )}

        {/* Events */}
        {!loading && !error && events.length > 0 && (
          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-neutral-900 rounded-xl shadow-sm border border-gray-800 px-4 py-3 text-xs flex flex-col gap-1 hover:border-gray-600 transition-colors group"
              >
                {/* Top Row */}
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelBadgeStyles(
                      evt.level
                    )}`}
                  >
                    {evt.level}
                  </span>

                  <span className="text-gray-300 font-mono bg-gray-800 px-1.5 py-0.5 rounded">
                    {formatEventTime(evt.start)}
                  </span>
                </div>

                {/* Title */}
                <div className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                  {evt.title}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{evt.location || "Location TBD"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayCompetitions;

