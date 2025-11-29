
const https = require('https');

const CALENDAR_URL = "https://www.parktudor.org/calendar/calendar_379_gmt.ics";

// Helper to fetch data using native Node.js https
const fetchCalendar = () => {
  return new Promise((resolve, reject) => {
    https.get(CALENDAR_URL, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
};

// Helper to parse ICS date string
const parseICSDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Format: YYYYMMDD
  if (dateStr.length === 8) {
    const y = parseInt(dateStr.substring(0, 4));
    const m = parseInt(dateStr.substring(4, 6)) - 1;
    const d = parseInt(dateStr.substring(6, 8));
    return new Date(y, m, d);
  }

  // Format: YYYYMMDDTHHMMSS
  const y = parseInt(dateStr.substring(0, 4));
  const m = parseInt(dateStr.substring(4, 6)) - 1;
  const d = parseInt(dateStr.substring(6, 8));
  const h = parseInt(dateStr.substring(9, 11));
  const min = parseInt(dateStr.substring(11, 13));
  const s = parseInt(dateStr.substring(13, 15));

  if (dateStr.endsWith('Z')) {
    return new Date(Date.UTC(y, m, d, h, min, s));
  }
  return new Date(y, m, d, h, min, s);
};

// Helper to detect level
const detectLevel = (summary) => {
  const s = (summary || "").toLowerCase();
  if (s.includes("varsity") && !s.includes("junior")) return "Varsity";
  if (s.includes("jv") || s.includes("junior varsity")) return "JV";
  if (s.includes("ms") || s.includes("middle school") || s.includes("7th") || s.includes("8th")) return "MS";
  return "Other";
};

exports.handler = async (event, context) => {
  try {
    const icsData = await fetchCalendar();
    
    // Parse ICS
    const events = [];
    const lines = icsData.split(/\r\n|\n|\r/);
    let inEvent = false;
    let currentEvent = {};

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = {};
        continue;
      }
      if (line.startsWith('END:VEVENT')) {
        inEvent = false;
        if (currentEvent.SUMMARY && currentEvent.DTSTART) {
          const start = parseICSDate(currentEvent.DTSTART);
          // Default end is +2 hours if missing
          const end = currentEvent.DTEND 
            ? parseICSDate(currentEvent.DTEND) 
            : (start ? new Date(start.getTime() + 2 * 60 * 60 * 1000) : null);
            
          if (start) {
            events.push({
              id: currentEvent.UID || Math.random().toString(),
              title: currentEvent.SUMMARY,
              description: currentEvent.DESCRIPTION || "",
              location: currentEvent.LOCATION ? currentEvent.LOCATION.replace(/\\,/g, ',') : "TBD",
              start: start.toISOString(),
              end: end ? end.toISOString() : "",
              level: detectLevel(currentEvent.SUMMARY)
            });
          }
        }
        continue;
      }

      if (inEvent) {
        if (line.startsWith('SUMMARY:')) currentEvent.SUMMARY = line.substring(8);
        else if (line.startsWith('DTSTART;')) currentEvent.DTSTART = line.split(':')[1];
        else if (line.startsWith('DTSTART:')) currentEvent.DTSTART = line.substring(8);
        else if (line.startsWith('DTEND;')) currentEvent.DTEND = line.split(':')[1];
        else if (line.startsWith('DTEND:')) currentEvent.DTEND = line.substring(6);
        else if (line.startsWith('LOCATION:')) currentEvent.LOCATION = line.substring(9);
        else if (line.startsWith('UID:')) currentEvent.UID = line.substring(4);
      }
    }

    // Determine "Today" in Indiana Timezone
    // We create a formatter for the specific timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Indiana/Indianapolis',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });

    const now = new Date();
    const todayStr = formatter.format(now); // e.g., "10/27/2023"

    // Filter events
    const todaysEvents = events.filter(evt => {
      const evtDate = new Date(evt.start);
      const evtDateStr = formatter.format(evtDate);
      return evtDateStr === todayStr;
    });

    // Sort: Level Priority then Time
    const levelPriority = { "Varsity": 1, "JV": 2, "MS": 3, "Other": 4 };
    todaysEvents.sort((a, b) => {
      const pA = levelPriority[a.level];
      const pB = levelPriority[b.level];
      if (pA !== pB) return pA - pB;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Content-Type": "application/json"
      },
      body: JSON.stringify(todaysEvents)
    };

  } catch (error) {
    console.error("Calendar Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch calendar", details: error.message })
    };
  }
};
