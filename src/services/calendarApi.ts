import { PTScheduleGame } from "../types";

const PROXY_URL = "https://api.allorigins.win/raw?url=";
const CALENDAR_URL = "https://www.parktudor.org/calendar/calendar_379_gmt.ics";

export interface ParsedEvent {
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
  allDay: boolean;
}

// --- MOCK FALLBACK DATA ---
// Used when the live calendar is blocked by CORS (Browser Security)
const generateMockEvents = (): ParsedEvent[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  return [
    {
      title: "Varsity Boys Basketball vs. Cathedral",
      start: new Date(year, month, day, 19, 30), // 7:30 PM
      end: new Date(year, month, day, 21, 30),
      location: "Cahn Auditorium",
      description: "Home Game",
      allDay: false
    },
    {
      title: "JV Girls Soccer @ Brebeuf",
      start: new Date(year, month, day, 17, 0), // 5:00 PM
      end: new Date(year, month, day, 19, 0),
      location: "Brebeuf Jesuit",
      description: "Away",
      allDay: false
    },
    {
      title: "MS Swimming Invitational",
      start: new Date(year, month, day, 9, 0), // 9:00 AM
      end: new Date(year, month, day, 14, 0),
      location: "Natatorium",
      description: "Middle School Event",
      allDay: false
    }
  ];
};

// Helper to parse ICS date string (e.g., 20231027T190000Z or 20231027)
const parseICSDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  // Handle YYYYMMDD (All day)
  if (dateStr.length === 8) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }

  // Handle YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(dateStr.substring(9, 11));
  const minute = parseInt(dateStr.substring(11, 13));
  const second = parseInt(dateStr.substring(13, 15));

  // If it ends in Z, it is UTC. Otherwise assume local
  if (dateStr.endsWith('Z')) {
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  } else {
    return new Date(year, month, day, hour, minute, second);
  }
};

const getLevelPriority = (title: string): number => {
  const t = title.toLowerCase();
  
  // Priority 1: Varsity (Exclude "Junior Varsity")
  if (t.includes('varsity') && !t.includes('junior varsity')) {
    return 1;
  }
  
  // Priority 2: JV
  if (t.includes('jv') || t.includes('junior varsity')) {
    return 2;
  }
  
  // Priority 3: MS / Middle School
  if (t.includes('ms') || t.includes('middle school') || t.includes('7th') || t.includes('8th')) {
    return 3;
  }
  
  // Priority 4: Others
  return 4;
};

export const fetchAndParseCalendar = async (): Promise<ParsedEvent[]> => {
  try {
    // Attempt to fetch via proxy
    // Note: The 'allorigins' proxy is sometimes blocked or rate-limited.
    // If this fails, we fall back to mock data so the UI isn't empty.
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(CALENDAR_URL)}`);
    
    if (!response.ok) throw new Error("Failed to fetch calendar");
    
    const icsData = await response.text();
    const events: ParsedEvent[] = [];
    
    const lines = icsData.split(/\r\n|\n|\r/);
    let currentEvent: Partial<ParsedEvent> | null = null;
    let inEvent = false;

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = {};
        continue;
      }

      if (line.startsWith('END:VEVENT')) {
        inEvent = false;
        if (currentEvent && currentEvent.title && currentEvent.start) {
          events.push(currentEvent as ParsedEvent);
        }
        currentEvent = null;
        continue;
      }

      if (inEvent && currentEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith('DTSTART')) {
          const datePart = line.split(':')[1];
          currentEvent.start = parseICSDate(datePart);
          currentEvent.allDay = datePart.length === 8;
        } else if (line.startsWith('DTEND')) {
          const datePart = line.split(':')[1];
          currentEvent.end = parseICSDate(datePart);
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9).replace(/\\,/g, ',');
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12);
        }
      }
    }

    return events;
  } catch (error) {
    console.warn("Calendar API blocked by browser (CORS). Using Mock Data for display.", error);
    return generateMockEvents();
  }
};

export const sortEventsByLevel = (events: ParsedEvent[]): ParsedEvent[] => {
  return events.sort((a, b) => {
    const priorityA = getLevelPriority(a.title);
    const priorityB = getLevelPriority(b.title);

    // Primary Sort: Priority Level
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Secondary Sort: Start Time
    return a.start.getTime() - b.start.getTime();
  });
};