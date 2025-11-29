
import React, { useEffect, useState, useMemo } from "react";
import { OutputAthlete, AthleteMetrics } from "../types";
import { getAthletes, getLiveCMJ, getProjected1RM, getReadiness, getCMJHistory, calculateStreak } from "../services/outputService";
import { TeamAggregateChart } from "./PerformanceCharts";
import { Trophy, Activity, ArrowUp, ArrowDown } from "lucide-react";

const PT_RED = "#C63527";

const TeamCompare: React.FC = () => {
  const [athletes, setAthletes] = useState<OutputAthlete[]>([]);
  const [metrics, setMetrics] = useState<Record<string, AthleteMetrics>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const list = await getAthletes();
        // Limit to 10 for demo performance
        const subset = list.slice(0, 10); 
        setAthletes(subset);

        const results = await Promise.all(
          subset.map(async (a) => {
            const [cmj, oneRmList, ready, cmjHist] = await Promise.all([
              getLiveCMJ(a.athleteId).catch(() => null),
              getProjected1RM(a.athleteId).catch(() => []),
              getReadiness(a.athleteId).catch(() => null),
              getCMJHistory(a.athleteId).catch(() => [])
            ]);

            const top1rm =
              oneRmList && oneRmList.length > 0
                ? oneRmList.reduce((best, current) =>
                    current.estimated1RM > best.estimated1RM
                      ? current
                      : best
                  )
                : null;
            
            // Calculate streak based on CMJ history for now
            const streak = calculateStreak(cmjHist.map(h => h.date));

            return {
              athleteId: a.athleteId,
              cmj,
              top1rm,
              readiness: ready,
              streak
            } as { athleteId: string } & AthleteMetrics;
          })
        );

        const map: Record<string, AthleteMetrics> = {};
        results.forEach((r) => {
          map[r.athleteId] = {
            cmj: r.cmj,
            top1rm: r.top1rm,
            readiness: r.readiness,
            streak: r.streak
          };
        });
        setMetrics(map);
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Unable to load team metrics from Output Sports.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sort athletes by CMJ Jump Height descending to create a "Leader Board" effect
  const sortedAthletes = useMemo(() => {
    return [...athletes].sort((a, b) => {
        const metricA = metrics[a.athleteId]?.cmj?.jumpHeight || 0;
        const metricB = metrics[b.athleteId]?.cmj?.jumpHeight || 0;
        return metricB - metricA; // Descending
    });
  }, [athletes, metrics]);

  // Prepare data for the aggregate chart (CMJ comparison)
  const chartData = athletes.map(a => ({
      name: `${a.firstName} ${a.lastName.charAt(0)}.`,
      value: metrics[a.athleteId]?.cmj?.jumpHeight || 0
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <h2
            className="text-2xl font-extrabold tracking-tight mb-1"
            style={{ color: PT_RED }}
          >
            Output Leader Boards
          </h2>
          <p className="text-sm text-gray-500">
            Live daily rankings based on Output Sports data.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">
            <Activity className="w-4 h-4" />
            Live Data
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {loading && (
         <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <span className="text-sm text-gray-500 animate-pulse">Syncing Leader Boards...</span>
         </div>
      )}

      {!loading && (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-semibold">
                                <tr>
                                <th className="p-4 text-left w-12">Rank</th>
                                <th className="p-4 text-left">Athlete</th>
                                <th className="p-4 text-left">Streak</th>
                                <th className="p-4 text-left">CMJ (cm)</th>
                                <th className="p-4 text-left">Peak Force (N)</th>
                                <th className="p-4 text-left">Mean Power (W)</th>
                                <th className="p-4 text-left">Top 1RM (kg)</th>
                                <th className="p-4 text-left">Readiness</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sortedAthletes.map((a, index) => {
                                const m = metrics[a.athleteId];
                                const cmj = m?.cmj;
                                const r = m?.readiness;
                                const top = m?.top1rm;
                                const streak = m?.streak || 0;
                                return (
                                    <tr key={a.athleteId} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-red-50/10' : ''}`}>
                                    <td className="p-4">
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs
                                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                              index === 1 ? 'bg-gray-100 text-gray-600' :
                                              index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 block flex items-center gap-2">
                                                {a.firstName} {a.lastName}
                                                {index === 0 && <Trophy className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                            </span>
                                            <span className="text-xs text-gray-400">{a.sport}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {streak > 0 ? (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${streak >= 7 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                                🔥 {streak} Days
                                            </span>
                                        ) : <span className="text-gray-300 text-xs">-</span>}
                                    </td>
                                    <td className="p-4 font-mono font-bold text-gray-900">
                                        {cmj ? cmj.jumpHeight.toFixed(2) : <span className="text-gray-300">--</span>}
                                    </td>
                                    <td className="p-4 font-mono text-gray-500">
                                        {cmj ? cmj.peakForce.toFixed(0) : <span className="text-gray-300">--</span>}
                                    </td>
                                    <td className="p-4 font-mono text-gray-500">
                                        {cmj ? cmj.meanPower.toFixed(0) : <span className="text-gray-300">--</span>}
                                    </td>
                                    <td className="p-4 font-mono text-gray-500">
                                        {top ? (
                                            <div className="flex flex-col">
                                                <span>{top.estimated1RM.toFixed(1)}</span>
                                                <span className="text-[10px] text-gray-400 uppercase">{top.liftType}</span>
                                            </div>
                                        ) : <span className="text-gray-300">--</span>}
                                    </td>
                                    <td className="p-4">
                                        {typeof r?.score !== "undefined" ? (
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold
                                                    ${(r.score || 0) > 7 ? 'bg-green-100 text-green-700' : (r.score || 0) > 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {r.score}
                                                </span>
                                                <span className="text-xs text-gray-500">{r.status}</span>
                                            </div>
                                        ) : <span className="text-gray-300">--</span>}
                                    </td>
                                    </tr>
                                );
                                })}
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Chart Section */}
            <TeamAggregateChart data={chartData} metricLabel="CMJ Jump Height Comparison" unit="cm" />
        </>
      )}
    </div>
  );
};

export default TeamCompare;
