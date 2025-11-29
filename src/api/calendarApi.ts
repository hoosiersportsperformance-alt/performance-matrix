
export interface AthleticEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  level: "Varsity" | "JV" | "MS" | "Other";
}

const MOCK_EVENTS: AthleticEvent[] = [
  {
    id: "mock-1",
    title: "Varsity Boys Basketball vs. Cathedral",
    description: "Home Game",
    location: "Cahn Auditorium",
    start: new Date(new Date().setHours(19, 30)).toISOString(),
    end: new Date(new Date().setHours(21, 30)).toISOString(),
    level: "Varsity"
  }
];

export async function fetchTodayAthletics(): Promise<AthleticEvent[]> {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  
  // PREVIEW MODE (AI Studio Sandbox) -> Mock Data
  if (hostname.includes("aistudio")) {
    console.log("Preview Mode: Using Mock Calendar Data");
    return MOCK_EVENTS;
  }

  // PRODUCTION / LOCAL (Netlify) -> Fetch real function
  try {
    const response = await fetch('/.netlify/functions/calendar');
    
    if (!response.ok) {
      throw new Error(`Calendar API Error: ${response.status}`);
    }

    const data = await response.json();
    return data as AthleticEvent[];

  } catch (error) {
    console.warn("Failed to fetch live calendar (falling back to mock):", error);
    return MOCK_EVENTS;
  }
}
