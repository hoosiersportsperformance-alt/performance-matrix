import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TeamCompare from "./components/TeamCompare";
import InBodyUploader from "./components/InBodyUploader";
import TodayCompetitions from "./components/TodayCompetitions";
import NutritionCalculator from "./components/NutritionCalculator";
import ExerciseLibrary from "./components/ExerciseLibrary";
import PantherWorkouts from "./components/PantherWorkouts";
import AICoach from "./components/AICoach";
import AIAthleticTrainer from "./components/AIAthleticTrainer";
import UserProfile from "./components/UserProfile";

import { TabKey, InBodyEntry, OutputAthlete } from "./types";
import { Menu, Sparkles, Loader2, RotateCw } from "lucide-react";
import { generateDailyInsight } from "./services/aiCoachService";
import { getAthletes, getAthleteSnapshot } from "./services/outputService";

const PT_RED = "#C63527";

const SAMPLE_INBODY_DATA: InBodyEntry[] = [
  { date: "2019-10-10", weight: 143.9, bodyFat: 41.3, skeletalMuscleMass: 44.3, basalMetabolicRate: 1180 },
  { date: "2019-11-30", weight: 139.9, bodyFat: 40.7, skeletalMuscleMass: 44.1, basalMetabolicRate: 1175 },
  { date: "2019-12-02", weight: 137.6, bodyFat: 39.2, skeletalMuscleMass: 43.4, basalMetabolicRate: 1170 },
  { date: "2019-12-15", weight: 136.2, bodyFat: 39.0, skeletalMuscleMass: 43.4, basalMetabolicRate: 1170 },
  { date: "2020-01-12", weight: 137.3, bodyFat: 39.4, skeletalMuscleMass: 43.6, basalMetabolicRate: 1172 },
  { date: "2020-02-10", weight: 134.3, bodyFat: 38.6, skeletalMuscleMass: 43.4, basalMetabolicRate: 1169 },
  { date: "2020-02-15", weight: 133.4, bodyFat: 37.8, skeletalMuscleMass: 43.6, basalMetabolicRate: 1168 },
  { date: "2020-03-04", weight: 130.3, bodyFat: 37.5, skeletalMuscleMass: 42.6, basalMetabolicRate: 1168 },
].reverse();

const App: React.FC = () => {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [inBodyData, setInBodyData] = useState<InBodyEntry[]>(SAMPLE_INBODY_DATA);
  const [athletes, setAthletes] = useState<OutputAthlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");

  const [dailyInsight, setDailyInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const list = await getAthletes();
        setAthletes(list);
        if (list.length > 0) setSelectedAthleteId(list[0].athleteId);
      } catch (e) {
        console.error("Failed to load athletes", e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedAthleteId) return;

    const loadInsight = async () => {
      setLoadingInsight(true);
      try {
        const snapshot = await getAthleteSnapshot(selectedAthleteId);
        const athlete = athletes.find(a => a.athleteId === selectedAthleteId);

        const text = await generateDailyInsight({
          name: athlete?.firstName || "Athlete",
          sport: athlete?.sport || "Unknown",
          readiness: snapshot.readiness,
          cmj: snapshot.cmj,
          topLift: snapshot.topLift,
        });

        setDailyInsight(text);
      } catch (e) {
        console.error(e);
        setDailyInsight("Focus on consistent effort and quality movement today.");
      } finally {
        setLoadingInsight(false);
      }
    };

    const t = setTimeout(loadInsight, 500);
    return () => clearTimeout(t);
  }, [selectedAthleteId, athletes]);

  const handleRefreshInsight = async () => {
    if (!selectedAthleteId) return;
    setLoadingInsight(true);
    try {
      const snapshot = await getAthleteSnapshot(selectedAthleteId);
      const athlete = athletes.find(a => a.athleteId === selectedAthleteId);

      const text = await generateDailyInsight({
        name: athlete?.firstName || "Athlete",
        sport: athlete?.sport || "Unknown",
        readiness: snapshot.readiness,
        cmj: snapshot.cmj,
        topLift: snapshot.topLift,
      });

      setDailyInsight(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900 selection:bg-red-100">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-black text-white p-4 pt-safe z-50 flex items-center justify-between shadow-md h-[calc(64px+env(safe-area-inset-top))]">

        <div className="flex items-center gap-3 mt-1">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"></div>

          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-tight text-white">
              Park <span style={{ color: "#C63527" }}>Tudor</span>
            </span>
            <span className="text-sm font-bold tracking-tight">
              <span style={{ color: "#C63527" }}>Performance</span>{" "}
              <span style={{ color: "white" }}>Matrix</span>
            </span>
          </div>
        </div>

        {/* CLOCK */}
        <div className="text-right mr-2">
          <div className="text-sm font-mono font-bold text-white">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* SIDEBAR */}
      <Sidebar
        currentTab={tab}
        onTabChange={setTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full lg:pl-80 p-4 pt-[calc(80px+env(safe-area-inset-top))] lg:p-10 lg:pt-10 transition-all duration-300 pb-safe">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* TOP HERO SECTION */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:h-72">

            {/* GAME CENTER CARD */}
            <div className="lg:col-span-1 bg-black rounded-3xl shadow-md border border-gray-800 p-1 overflow-hidden h-56 lg:h-full relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
              <div className="h-full p-4">
                <TodayCompetitions currentTime={currentTime} />
              </div>
            </div>

            {/* DAILY PERFORMANCE INSIGHT */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#0077B6] to-[#023e8a] rounded-3xl shadow-md border border-blue-600 p-8 flex flex-col relative overflow-hidden h-64 lg:h-full group">
              <div className="absolute top-0 right-0 p-10 bg-white rounded-full transform translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-10"></div>

              <div className="relative z-10 flex items-center justify-between mb-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Daily Performance Insight
                </h2>

                <div className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live AI Analysis
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loadingInsight ? (
                  <div className="h-full flex flex-col items-center justify-center text-blue-200 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm font-medium">
                      Generating personalized athlete report...
                    </span>
                  </div>
                ) : (
                  <div className="text-base text-blue-50 leading-relaxed font-medium whitespace-pre-wrap">
                    {dailyInsight}
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleRefreshInsight}
                  disabled={loadingInsight}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-sm transition-colors disabled:opacity-40"
                >
                  <RotateCw className={`w-4 h-4 ${loadingInsight ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC ROUTED CONTENT */}
          <main className="bg-transparent min-h-[500px]">
            {tab === "dashboard" && (
              <Dashboard
                onNavigate={setTab}
                athletes={athletes}
                selectedAthleteId={selectedAthleteId}
                onAthleteChange={setSelectedAthleteId}
              />
            )}

            {tab === "profile" && (
              <UserProfile
                athletes={athletes}
                selectedAthleteId={selectedAthleteId}
                onAthleteChange={setSelectedAthleteId}
              />
            )}

            {tab === "coach" && <AICoach />}
            {tab === "trainer" && <AIAthleticTrainer />}
            {tab === "workouts" && <PantherWorkouts />}
            {tab === "compare" && <TeamCompare />}
            {tab === "nutrition" && <NutritionCalculator inBodyData={inBodyData} />}
            {tab === "library" && <ExerciseLibrary />}
            {tab === "inbody" && <InBodyUploader data={inBodyData} onDataLoaded={setInBodyData} />}
            {tab === "schedule" && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[60vh]">
                <h2
                  className="text-2xl font-extrabold tracking-tight mb-6"
                  style={{ color: PT_RED }}
                >
                  PT Game Center
                </h2>
                <TodayCompetitions currentTime={currentTime} />
              </div>
            )}
          </main>
          <footer className="text-center text-xs text-gray-400 pt-10 pb-10 safe-pb">
            © {new Date().getFullYear()} Park Tudor — Panther Performance Matrix v1.4
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;





