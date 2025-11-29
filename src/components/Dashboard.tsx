
import React, { useEffect, useState, useMemo } from "react";
import { OutputAthlete, CMJData, Projected1RM, ReadinessData, PerformanceHistory, TabKey, WellnessInputs, AIReadinessResult } from "../types";
import { getLiveCMJ, getProjected1RM, getReadiness, getCMJHistory, get1RMHistory, calculateStreak } from "../services/outputService";
import { generateAIReadiness } from "../services/readinessService";
import MetricCard from "./MetricCard";
import { AthleteHistoryChart } from "./PerformanceCharts";
import WellnessModal from "./WellnessModal";
import { Flame, Utensils, Activity, Dumbbell, AlertCircle, MessageSquare, Zap, ArrowUp, ArrowRight, Sparkles, Trophy, PlusCircle, Brain, Stethoscope, ChevronDown, User } from "lucide-react";

const PT_RED = "#C63527";
const KEY_LIFTS = ["Back Squat", "Front Squat", "Bench Press", "Incline Bench Press", "Deadlift"];

const CHAT_PROMPTS = [
    "How do I improve my vertical?",
    "What are VBT zones?",
    "High protein meal ideas?"
];

interface DashboardProps {
    onNavigate: (tab: TabKey) => void;
    athletes: OutputAthlete[];
    selectedAthleteId: string;
    onAthleteChange: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, athletes, selectedAthleteId, onAthleteChange }) => {
  // Local state for detailed metrics
  const [liveCMJ, setLiveCMJ] = useState<CMJData | null>(null);
  const [projected1RM, setProjected1RM] = useState<Projected1RM[] | null>(null);
  const [outputReadiness, setOutputReadiness] = useState<ReadinessData | null>(null);
  const [aiReadiness, setAiReadiness] = useState<AIReadinessResult | null>(null);

  const [cmjHistory, setCmjHistory] = useState<PerformanceHistory[]>([]);
  const [rmHistory, setRmHistory] = useState<PerformanceHistory[]>([]);
  const [promptIndex, setPromptIndex] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isWellnessOpen, setIsWellnessOpen] = useState(false);
  const [isWellnessLoading, setIsWellnessLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
        setPromptIndex(prev => (prev + 1) % CHAT_PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedAthleteId) return;
    const loadMetrics = async () => {
      setLoading(true);
      setErrorMsg("");
      setLiveCMJ(null);
      setProjected1RM(null);
      setOutputReadiness(null);
      setCmjHistory([]);
      setRmHistory([]);
      setAiReadiness(null); 
      
      try {
        const [cmj, oneRm, ready, cmjHist, rmHist] = await Promise.all([
          getLiveCMJ(selectedAthleteId),
          getProjected1RM(selectedAthleteId),
          getReadiness(selectedAthleteId),
          getCMJHistory(selectedAthleteId),
          get1RMHistory(selectedAthleteId)
        ]);
        setLiveCMJ(cmj);
        setProjected1RM(oneRm);
        setOutputReadiness(ready);
        setCmjHistory(cmjHist);
        setRmHistory(rmHist);
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Connection issue detected. Some live metrics may be unavailable.");
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [selectedAthleteId]);

  const currentStreak = useMemo(() => {
    const dates = [
        ...cmjHistory.map(h => h.date),
        ...(projected1RM || []).map(r => r.timestamp)
    ];
    return calculateStreak(dates);
  }, [cmjHistory, projected1RM]);

  const topLift = useMemo(() => {
    if (!projected1RM) return null;
    const relevant = projected1RM.filter(p => KEY_LIFTS.includes(p.liftType));
    if (relevant.length === 0) return null;
    return relevant.reduce((prev, curr) => prev.estimated1RM > curr.estimated1RM ? prev : curr);
  }, [projected1RM]);

  const handleWellnessSubmit = async (inputs: WellnessInputs) => {
    setIsWellnessLoading(true);
    try {
        const recentCMJ = cmjHistory.slice(0, 7);
        const startCMJ = recentCMJ.length > 0 ? recentCMJ[recentCMJ.length - 1].value : 0;
        const endCMJ = recentCMJ.length > 0 ? recentCMJ[0].value : 0;
        const cmjTrend = endCMJ - startCMJ;

        const result = await generateAIReadiness(inputs, {
            consistency: currentStreak,
            cmjTrend7: cmjTrend,
            volumeTrend7: 1
        });
        
        setAiReadiness(result);
        setIsWellnessOpen(false);
    } catch (e) {
        console.error("Wellness submission failed", e);
    } finally {
        setIsWellnessLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900">
            Performance <span style={{ color: PT_RED }}>Dashboard</span>
          </h2>
          <p className="text-gray-500 font-medium">
            Live metrics and training intelligence for Park Tudor Athletes.
          </p>
        </div>
        
        {/* PROMINENT ATHLETE SELECTOR */}
        <div className="relative group min-w-[300px]">
            <div className="absolute inset-0 bg-red-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-white pl-4 pr-10 py-4 rounded-3xl border-2 border-red-200 shadow-md flex items-center gap-4 cursor-pointer hover:border-red-400 transition-all transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-md">
                    <User className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[11px] uppercase font-extrabold text-red-500 tracking-wider">Active Athlete Profile</span>
                    <select
                        className="appearance-none bg-transparent border-none p-0 text-2xl font-black text-gray-900 focus:ring-0 cursor-pointer w-full"
                        value={selectedAthleteId}
                        onChange={(e) => onAthleteChange(e.target.value)}
                        disabled={athletes.length === 0}
                    >
                        {athletes.length === 0 && <option>Loading...</option>}
                        {athletes.map((a) => (
                            <option key={a.athleteId} value={a.athleteId}>
                            {a.firstName} {a.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-6 h-6 text-red-400" />
                </div>
            </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 px-6 py-4 text-sm text-orange-900 flex items-center gap-3">
           <AlertCircle className="w-5 h-5 text-orange-600" />
           <div>
             <span className="font-bold block">Connectivity Notice</span>
             {errorMsg}
           </div>
        </div>
      )}
      
      {loading && (
         <div className="w-full h-40 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 gap-3">
            <Activity className="w-8 h-8 text-gray-300 animate-bounce" />
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Syncing Data...</span>
         </div>
      )}

      {!loading && (
        <>
        {/* --- STREAK & READINESS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Readiness Card (First on Mobile) */}
            <div className={`lg:col-span-2 rounded-3xl shadow-sm border-2 relative group overflow-hidden transition-all duration-300
                ${aiReadiness?.color === 'Green' ? 'bg-gradient-to-br from-green-50 to-white border-green-400 shadow-green-100/50' : 
                  aiReadiness?.color === 'Yellow' ? 'bg-gradient-to-br from-yellow-50 to-white border-yellow-400 shadow-yellow-100/50' : 
                  aiReadiness?.color === 'Red' ? 'bg-gradient-to-br from-red-50 to-white border-red-400 shadow-red-100/50' : 
                  // OUTPUT READINESS COLORS (Vivid)
                  outputReadiness && (outputReadiness.score || 0) > 7 ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-500' :
                  outputReadiness && (outputReadiness.score || 0) > 4 ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-500' :
                  outputReadiness ? 'bg-gradient-to-br from-red-100 to-red-50 border-red-500' :
                  'bg-white border-gray-200'}`}>
                
                {aiReadiness ? (
                     <div className="flex flex-col md:flex-row h-full relative z-10">
                        <div className="p-6 flex-1 flex flex-col justify-center">
                             <div className="flex items-center gap-3 mb-2">
                                <Sparkles className={`w-5 h-5 ${
                                    aiReadiness.color === 'Green' ? 'text-green-500' :
                                    aiReadiness.color === 'Yellow' ? 'text-yellow-500' :
                                    'text-red-500'
                                }`} />
                                <h3 className={`text-sm font-bold uppercase tracking-widest ${
                                    aiReadiness.color === 'Green' ? 'text-green-700' :
                                    aiReadiness.color === 'Yellow' ? 'text-yellow-700' :
                                    'text-red-700'
                                }`}>AI Readiness Score</h3>
                             </div>
                             <div className="flex items-baseline gap-3">
                                <span className={`text-6xl font-extrabold tracking-tighter 
                                    ${aiReadiness.color === 'Green' ? 'text-green-600' : aiReadiness.color === 'Yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {aiReadiness.readinessScore}
                                </span>
                                <span className="text-lg font-bold text-gray-400">/ 100</span>
                             </div>
                             <p className="text-gray-700 mt-2 font-medium leading-relaxed">"{aiReadiness.insight}"</p>
                             <div className="mt-3 flex items-center gap-2">
                                <button 
                                    onClick={() => setIsWellnessOpen(true)}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-white/60 px-3 py-1.5 rounded-lg border border-gray-200/50 hover:bg-white transition-colors"
                                >
                                    Update Log
                                </button>
                             </div>
                        </div>
                        <div className={`p-6 md:w-64 flex flex-col items-center justify-center text-center rounded-3xl md:rounded-l-none border-l border-white/20
                             ${aiReadiness.color === 'Green' ? 'bg-green-100/50 text-green-900' : aiReadiness.color === 'Yellow' ? 'bg-yellow-100/50 text-yellow-900' : 'bg-red-100/50 text-red-900'}`}>
                             <Brain className="w-8 h-8 mb-2 opacity-50" />
                             <span className="text-lg font-bold uppercase">{aiReadiness.color} Zone</span>
                             <p className="text-xs mt-2 opacity-80 font-medium px-2">{aiReadiness.coachNote}</p>
                        </div>
                    </div>
                ) : outputReadiness && typeof outputReadiness.score !== "undefined" ? (
                    <div className="flex flex-col md:flex-row h-full relative z-10">
                        {/* FALLBACK TO OUTPUT DATA (Styled to pop) */}
                        <div className="p-6 flex-1 flex flex-col justify-center">
                             <div className="flex items-center gap-3 mb-2">
                                <Activity className="w-5 h-5 text-gray-800" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Output Readiness</h3>
                             </div>
                             <div className="flex items-baseline gap-3">
                                <span className={`text-6xl font-extrabold tracking-tighter drop-shadow-sm
                                    ${outputReadiness.score > 7 ? 'text-green-800' : outputReadiness.score > 4 ? 'text-yellow-800' : 'text-red-800'}`}>
                                    {outputReadiness.score}
                                </span>
                                <span className="text-lg font-bold text-gray-600">/ 10</span>
                             </div>
                             <div className="mt-4">
                                <button 
                                    onClick={() => setIsWellnessOpen(true)}
                                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all"
                                >
                                    <Sparkles className="w-4 h-4" /> Calculate AI Score
                                </button>
                             </div>
                        </div>
                        <div className={`p-6 md:w-64 flex flex-col items-center justify-center text-center rounded-3xl md:rounded-l-none border-l border-white/20
                            ${outputReadiness.score > 7 ? 'bg-green-200/50 text-green-900' : outputReadiness.score > 4 ? 'bg-yellow-200/50 text-yellow-900' : 'bg-red-200/50 text-red-900'}`}>
                             <span className="text-lg font-bold uppercase">{outputReadiness.status}</span>
                             <p className="text-xs mt-2 opacity-80 font-medium px-2">{outputReadiness.notes}</p>
                        </div>
                    </div>
                ) : (
                    // NO DATA STATE
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-3xl border-2 border-gray-200">
                        <Activity className="w-10 h-10 text-gray-300 mb-2" />
                        <h3 className="text-lg font-bold text-gray-900">Calculate Readiness</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-sm">
                            Log your daily wellness (sleep, mood, soreness) to generate an AI-powered readiness score.
                        </p>
                        <button 
                            onClick={() => setIsWellnessOpen(true)}
                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg"
                        >
                            <PlusCircle className="w-4 h-4" /> Log Daily Wellness
                        </button>
                    </div>
                )}
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                <div className="relative z-10 flex items-center gap-4">
                     <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <Flame className="w-8 h-8 text-white fill-white" />
                     </div>
                     <div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80">Consistency Streak</div>
                        <div className="text-4xl font-extrabold">{currentStreak} <span className="text-xl">Days</span></div>
                     </div>
                </div>
                <div className="mt-4 text-sm font-medium opacity-90">
                    {currentStreak >= 7 ? "You're on fire! Keep the momentum going." : "Log data daily to build your streak."}
                </div>
            </div>
        </div>

        {/* --- PERFORMANCE METRICS ROW (Units: lbs/inches) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <MetricCard
                label="Mean Power"
                value={liveCMJ ? `${liveCMJ.meanPower.toFixed(0)} W` : null}
                sublabel="Dynamic Power"
                icon={Zap}
                colorClass="text-purple-600 bg-purple-50"
                borderClass="border-purple-400"
            />
            <MetricCard
                label="Peak Force"
                value={liveCMJ ? `${liveCMJ.peakForce.toFixed(0)} N` : null}
                sublabel="Max Strength Output"
                icon={Dumbbell}
                colorClass="text-orange-600 bg-orange-50"
                borderClass="border-orange-400"
            />
            <MetricCard
                label="CMJ Jump Height"
                // Assuming liveCMJ comes in as cm, convert to inches: 1 cm = 0.393701 in
                value={liveCMJ ? `${(liveCMJ.jumpHeight * 0.3937).toFixed(1)} in` : null}
                sublabel="Explosiveness"
                icon={ArrowUp}
                colorClass="text-blue-600 bg-blue-50"
                borderClass="border-blue-400"
            />
        </div>

        {/* --- CHARTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AthleteHistoryChart 
                data={cmjHistory.map(d => ({...d, value: d.value * 0.3937}))} 
                title="Jump Height History" 
                unit="in" 
                color="#2563eb" // Blue
            />
            <AthleteHistoryChart 
                data={rmHistory.map(d => ({...d, value: d.value * 2.20462}))} 
                title="Strength Progress (1RM)" 
                unit="lbs" 
                color={PT_RED} 
            />
        </div>

        {/* --- FEATURE & TOOLS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* 1. PROJECTED 1RM LIST */}
            <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-200 p-6 flex flex-col h-full">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><Dumbbell className="w-5 h-5" /></div>
                    Projected 1RM
                </h3>
                <div className="space-y-3 flex-1">
                    {KEY_LIFTS.map(liftName => {
                        const data = projected1RM?.find(p => p.liftType === liftName);
                        const isTop = topLift && data && topLift.liftType === liftName;
                        
                        return (
                            <div key={liftName} 
                                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                    isTop 
                                        ? 'bg-slate-900 text-white shadow-md ring-1 ring-slate-700 scale-[1.02]' 
                                        : 'bg-gray-50 border border-gray-100'
                                }`}
                            >
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold uppercase tracking-wide ${isTop ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {liftName}
                                    </span>
                                    {isTop && (
                                        <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold mt-0.5">
                                            <Trophy className="w-3 h-3 fill-yellow-400" /> Personal Best
                                        </div>
                                    )}
                                </div>
                                
                                <div className="text-right">
                                    {data ? (
                                        <>
                                            <span className={`text-xl font-extrabold ${isTop ? 'text-white' : 'text-gray-900'}`}>
                                                {/* Convert KG to LBS */}
                                                {(data.estimated1RM * 2.20462).toFixed(0)} <span className={`text-sm font-medium ${isTop ? 'text-slate-400' : 'text-gray-400'}`}>lbs</span>
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-300 font-bold">--</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. NUTRITION TARGETS */}
            <div 
                onClick={() => onNavigate('nutrition')}
                className="group cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-400 p-6 flex flex-col justify-between hover:border-emerald-500 transition-all duration-300"
            >
                <div>
                     <div className="w-12 h-12 bg-emerald-200 rounded-2xl flex items-center justify-center text-emerald-800 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Utensils className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-extrabold text-emerald-900 mb-2">
                         Nutrition Targets
                     </h3>
                     <p className="text-sm text-emerald-700 leading-relaxed font-medium opacity-80">
                         AI-powered macro calculator for muscle gain and performance.
                     </p>
                </div>
                <div className="mt-6 flex items-center text-sm font-bold text-emerald-800 group-hover:gap-2 transition-all">
                    Open Calculator <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>

            {/* 3. PERFORMANCE CHAT */}
            <div 
                onClick={() => onNavigate('coach')}
                className="group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-400 p-6 flex flex-col justify-between hover:border-blue-500 transition-all duration-300 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 bg-blue-100 rounded-bl-full opacity-20 transform translate-x-4 -translate-y-4"></div>
                <div>
                     <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-blue-200 rounded-2xl flex items-center justify-center text-blue-800 mb-4 shadow-sm group-hover:scale-110 transition-transform relative z-10">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                     </div>
                     <h3 className="text-xl font-extrabold text-blue-900 mb-2 relative z-10">
                         Performance Chat
                     </h3>
                     
                     {/* Rotating Prompts */}
                     <div className="h-12 relative z-10">
                        <div key={promptIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <p className="text-sm text-blue-700 leading-relaxed font-medium opacity-90 italic">
                                "{CHAT_PROMPTS[promptIndex]}"
                            </p>
                        </div>
                     </div>
                </div>
                <div className="mt-2 flex items-center justify-between relative z-10">
                    <span className="text-sm font-bold text-blue-800 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Ask a Question <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>

            {/* 4. AI ATHLETIC TRAINER (Quick Access) */}
            <div 
                onClick={() => onNavigate('trainer')}
                className="group cursor-pointer bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border-2 border-red-400 p-6 flex flex-col justify-between hover:border-red-500 transition-all duration-300 relative overflow-hidden"
            >
                 <div className="absolute top-0 right-0 p-8 bg-red-100 rounded-bl-full opacity-30 transform translate-x-4 -translate-y-4"></div>
                 <div>
                    <div className="w-12 h-12 bg-red-200 rounded-2xl flex items-center justify-center text-red-800 mb-4 shadow-sm group-hover:scale-110 transition-transform relative z-10">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-extrabold text-red-900 mb-2 relative z-10">
                        AI Athletic Trainer
                    </h3>
                    <p className="text-sm text-red-800 leading-relaxed font-medium opacity-80 relative z-10">
                        Injury triage & soreness guidance.
                    </p>
                 </div>
                 <div className="mt-6 flex items-center text-sm font-bold text-red-800 group-hover:gap-2 transition-all relative z-10">
                    Check Symptoms <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>

        </div>
        </>
      )}

      {/* Wellness Modal Overlay */}
      <WellnessModal 
         isOpen={isWellnessOpen}
         onClose={() => setIsWellnessOpen(false)}
         onSubmit={handleWellnessSubmit}
         isLoading={isWellnessLoading}
      />
    </div>
  );
};

export default Dashboard;
