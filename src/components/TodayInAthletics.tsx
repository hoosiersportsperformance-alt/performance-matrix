import React, { useEffect, useState } from "react";
import { useTodayAthletics } from "../hooks/useTodayAthletics";
import { MapPin, Clock } from "lucide-react";

// Park Tudor Red Brand Color
const PT_RED = "#C63527";

const TodayInAthletics: React.FC = () => {
  const { events, loading, error } = useTodayAthletics();

  // ============================
  // LIVE DATE + TIME
  // ============================
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // ============================
  // GAME TIME FORMATTER
  // ============================
  const formatGameTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ============================
  // LEVEL BADGE STYLES
  // ============================
  const getLevelBadgeStyles = (level: string) => {
    switch (level) {
      case "Varsity":
        return { bg: PT_RED, text: "white", border: "none" };
      case "JV":
        return { bg: "white", text: "black", border: "1px solid white" };
      case "MS":
        return { bg: "#333", text: "white", border: "1px solid #666" };
      default:
        return { bg: "#444", text: "white", border: "none" };
    }
  };

  return (
    <div
      className="rounded-3xl shadow-lg border border-gray-700 p-8 h-full flex flex-col"
      style={{ backgroundColor: "black" }}
    >
      {/* ============================
          HEADER AREA (Larger, Cleaner)
      ============================ */}
      <div className="flex flex-col mb-10">
        
        {/* GAME CENTER Title */}
        <h2
          className="text-3xl font-extrabold tracking-wide uppercase mb-2"
          style={{ color: PT_RED }}
        >
          Game Center
        </h2>

        {/* LIVE Date + Time */}
        <div className="flex flex-row items-center gap-6">
          <span className="text-lg text-white font-semibold">
            {formattedDate}
          </span>

          <span className="text-xl text-gray-300 font-bold">
            {formattedTime}
          </span>
        </div>

        {/* ============================
            LIVE ATHLETICS CALENDAR LINK
        ============================ */}
        <a
          href="https://www.parktudor.org/calendar/calendar_379_gmt.ics"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wide shadow-lg"
          style={{
            backgroundColor: PT_RED,
            color: "white",
            letterSpacing: "1px",
            boxShadow: "0px 0px 12px rgba(198, 53, 39, 0.55)",
          }}
        >
          View Live Athletics Calendar
        </a>
      </div>

      {/* ============================
          MAIN BODY CONTENT
      ============================ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 space-y-4">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-300 font-medium">
              Loading games...
            </span>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="bg-red-900 border border-red-700 text-red-100 p-5 rounded-xl text-lg text-center">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-900 rounded-2xl border border-dashed border-gray-700 p-8">
            <span className="text-gray-400 font-medium text-lg">
              No games scheduled for today.
            </span>
          </div>
        )}

        {/* EVENT LIST */}
        {!loading && !error && events.length > 0 && (
          <div className="space-y-6">
            {events.map((evt) => {
              const badgeStyle = getLevelBadgeStyles(evt.level);

              return (
                <div
                  key={evt.id}
                  className="group relative flex flex-col rounded-2xl p-6 transition-all hover:shadow-xl"
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid #333",
                  }}
                >
                  {/* TOP ROW */}
                  <div className="flex justify-between items-start mb-4">

                    {/* LEVEL BADGE */}
                    <span
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md"
                      style={{
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: badgeStyle.border,
                      }}
                    >
                      {evt.level}
                    </span>

                    {/* GAME TIME */}
                    <div
                      className="flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-lg"
                      style={{ backgroundColor: "#222", color: "white" }}
                    >
                      <Clock className="w-4 h-4 text-gray-300" />
                      {formatGameTime(evt.start)}
                    </div>
                  </div>

                  {/* GAME TITLE */}
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "white" }}
                  >
                    {evt.title}
                  </h3>

                  {/* LOCATION */}
                  <div
                    className="flex items-center gap-2 text-sm mt-auto"
                    style={{ color: "#bbb" }}
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">
                      {evt.location || "Location TBD"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default TodayInAthletics;
