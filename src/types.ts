
export interface OutputAthlete {
  athleteId: string;
  firstName: string;
  lastName: string;
  sport: string;
  height?: string;
  weight?: string;
  gradYear?: string;
}

export interface CMJData {
  timestamp: string;
  jumpHeight: number;
  peakForce: number;
  meanPower: number;
}

export interface Projected1RM {
  liftType: string;
  estimated1RM: number;
  velocityAtLoad: number;
  loadUsed: number;
  timestamp: string;
}

export interface ReadinessData {
  score?: number;
  status?: string;
  notes?: string;
  [key: string]: any;
}

export interface PTScheduleGame {
  sport: string;
  team: string;
  opponent: string;
  time: string;
  venue: string;
  date: string;
}

export interface InBodyEntry {
  date: string;
  weight: number;
  bodyFat: number;
  skeletalMuscleMass: number;
  basalMetabolicRate: number;
}

export interface AthleteMetrics {
  cmj: CMJData | null;
  top1rm: Projected1RM | null;
  readiness: ReadinessData | null;
  streak: number;
}

export interface PerformanceHistory {
  date: string;
  value: number;
  metric: string;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  strengths: string[];
  improvements: string[];
}

export interface Exercise {
  id: string;
  name: string;
  category: string; // Simplified string to accommodate API data
  equipment: string;
  cues: string[];
  primaryMuscles: string[];
  videoUrl?: string; // YouTube Embed URL (Local DB)
  gifUrl?: string;   // Animated GIF URL (ExerciseDB API)
}

export interface WorkoutGoal {
  id: string;
  title: string; // e.g., "Bench Press 100kg"
  startValue: number; // Baseline value when goal was created
  currentValue: number;
  targetValue: number;
  unit: string; // "kg", "lbs", "reps", "secs"
  deadline?: string; // ISO Date string
  createdAt: string;
}

export interface WellnessInputs {
  sleepHours: number;
  soreness: number; // 1-10
  fatigue: number; // 1-10
  stress: number; // 1-10
  mood: number; // 1-10
  comments?: string;
}

export interface AIReadinessResult {
  readinessScore: number;
  color: "Green" | "Yellow" | "Red";
  insight: string;
  coachNote: string;
  timestamp: string;
}

export type TabKey = "dashboard" | "compare" | "inbody" | "schedule" | "nutrition" | "library" | "workouts" | "coach" | "profile" | "trainer";
