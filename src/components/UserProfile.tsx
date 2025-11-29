
import React, { useState, useEffect } from 'react';
import { OutputAthlete, Projected1RM, CMJData, ReadinessData } from '../types';
import { getProjected1RM, getLiveCMJ, getReadiness } from '../services/outputService';
import { User, Activity, Trophy, Calendar, Dumbbell, ShieldCheck, Loader2, ExternalLink, Ruler, Weight, GraduationCap } from 'lucide-react';

const PT_RED = "#C63527";

interface UserProfileProps {
    athletes?: OutputAthlete[];
    selectedAthleteId?: string;
    onAthleteChange?: (id: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ athletes = [], selectedAthleteId, onAthleteChange }) => {
  const [athleteData, setAthleteData] = useState<OutputAthlete | null>(null);
  
  const [metrics, setMetrics] = useState<{
    oneRm: Projected1RM[];
    cmj: CMJData | null;
    readiness: ReadinessData | null;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedAthleteId) return;

    const loadProfile = async () => {
      setLoading(true);
      const selected = athletes.find(a => a.athleteId === selectedAthleteId);
      setAthleteData(selected || null);

      try {
        const [oneRm, cmj, readiness] = await Promise.all([
          getProjected1RM(selectedAthleteId),
          getLiveCMJ(selectedAthleteId),
          getReadiness(selectedAthleteId)
        ]);
        setMetrics({ oneRm, cmj, readiness });
      } catch (error) {
        console.error("Failed to load profile metrics", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [selectedAthleteId, athletes]);

  if (!selectedAthleteId) return null;

  const bestLift = metrics?.oneRm && metrics.oneRm.length > 0
    ? metrics.oneRm.reduce((prev, current) => (prev.estimated1RM > current.estimated1RM) ? prev : current)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: PT_RED }}>
            My Profile
          </h2>
          <p className="text-sm text-gray-500">
            Connected to Output Sports Identity
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Viewing Profile:</span>
            <select 
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-2.5 shadow-sm min-w-[200px]"
                value={selectedAthleteId}
                onChange={(e) => onAthleteChange && onAthleteChange(e.target.value)}
                disabled={!onAthleteChange}
            >
                {athletes.map(a => (
                    <option key={a.athleteId} value={a.athleteId}>
                        {a.firstName} {a.lastName}
                    </option>
                ))}
            </select>
        </div>
      </div>

      {loading && (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-3 text-red-500" />
              <span className="text-sm font-medium">Syncing profile data...</span>
          </div>
      )}

      {!loading && athleteData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: ID Card */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                    <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 relative">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                    <div className="px-6 pb-6 text-center -mt-12 relative">
                        <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-lg mb-3">
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900">
                            {athleteData.firstName} {athleteData.lastName}
                        </h3>
                        <p className="text-sm text-red-600 font-bold uppercase tracking-wide mt-1">
                            {athleteData.sport}
                        </p>
                        
                        <div className="mt-6 flex flex-col gap-2">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <Ruler className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                                    <div className="text-xs font-bold text-gray-700">{athleteData.height || "--"}</div>
                                    <div className="text-[10px] text-gray-400">Height</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <Weight className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                                    <div className="text-xs font-bold text-gray-700">{athleteData.weight || "--"}</div>
                                    <div className="text-[10px] text-gray-400">Weight</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <GraduationCap className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                                    <div className="text-xs font-bold text-gray-700">{athleteData.gradYear || "--"}</div>
                                    <div className="text-[10px] text-gray-400">Class</div>
                                </div>
                            </div>
                             <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-mono text-gray-500 border border-gray-200 inline-block mx-auto mt-2">
                                ID: {athleteData.athleteId}
                             </span>
                        </div>
                    </div>
                </div>

                {/* Connection Status */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Accounts Connected</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="text-sm font-bold text-green-900">Output Sports</div>
                                    <div className="text-[10px] text-green-700">Data Synced</div>
                                </div>
                            </div>
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-70">
                            <div className="flex items-center gap-3">
                                <Dumbbell className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-sm font-bold text-gray-700">TrainHeroic</div>
                                    <div className="text-[10px] text-gray-500">Not Linked</div>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Stats & Performance */}
            <div className="lg:col-span-2 space-y-6">
                {/* Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 uppercase">Strongest Lift</span>
                        </div>
                        {bestLift ? (
                            <div>
                                <div className="text-2xl font-extrabold text-gray-900">{(bestLift.estimated1RM * 2.20462).toFixed(0)} lbs</div>
                                <div className="text-xs text-gray-500">{bestLift.liftType} (Est. 1RM)</div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic">No lift data available</div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 uppercase">Latest CMJ</span>
                        </div>
                        {metrics?.cmj ? (
                            <div>
                                <div className="text-2xl font-extrabold text-gray-900">{(metrics.cmj.jumpHeight * 0.3937).toFixed(1)} in</div>
                                <div className="text-xs text-gray-500">Peak Force: {metrics.cmj.peakForce.toFixed(0)} N</div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic">No jump data available</div>
                        )}
                    </div>
                </div>

                {/* 1RM Breakdown Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Projected 1RM Summary</h3>
                        <p className="text-xs text-gray-500">Based on recent velocity-based training sessions</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Lift</th>
                                    <th className="px-6 py-3 font-semibold">Est. 1RM</th>
                                    <th className="px-6 py-3 font-semibold">Velocity</th>
                                    <th className="px-6 py-3 font-semibold">Load Used</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics?.oneRm && metrics.oneRm.length > 0 ? (
                                    metrics.oneRm.map((lift, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-900">{lift.liftType}</td>
                                            <td className="px-6 py-3 font-bold text-gray-900">{(lift.estimated1RM * 2.20462).toFixed(0)} lbs</td>
                                            <td className="px-6 py-3 text-gray-500">{lift.velocityAtLoad} m/s</td>
                                            <td className="px-6 py-3 text-gray-500">{(lift.loadUsed * 2.20462).toFixed(0)} lbs</td>
                                            <td className="px-6 py-3 text-gray-400 text-xs">
                                                {new Date(lift.timestamp).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                                            No strength data recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Readiness History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Latest Status</h3>
                        {metrics?.readiness && (
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                (metrics.readiness.score || 0) > 6 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                Score: {metrics.readiness.score}
                            </span>
                        )}
                    </div>
                    {metrics?.readiness ? (
                        <div className="space-y-2">
                             <div className="p-3 bg-gray-50 rounded-xl flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-gray-800">Status: {metrics.readiness.status}</div>
                                    <div className="text-xs text-gray-500 mt-1">{metrics.readiness.notes}</div>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 italic">No readiness score logged today.</div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
