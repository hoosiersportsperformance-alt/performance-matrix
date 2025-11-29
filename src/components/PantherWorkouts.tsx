
import React, { useState, useEffect } from 'react';
import { ExternalLink, Activity, Smartphone, Target, Plus, Trash2, Edit2, Check, X, Calendar, TrendingUp } from 'lucide-react';
import { WorkoutGoal } from '../types';

const PT_RED = "#C63527";

const PantherWorkouts: React.FC = () => {
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Form State
  const [newGoal, setNewGoal] = useState({
    title: "",
    startValue: "",
    targetValue: "",
    unit: "kg",
    deadline: ""
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pantherGoals');
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse goals", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('pantherGoals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetValue) return;

    const startVal = parseFloat(newGoal.startValue) || 0;
    
    const goal: WorkoutGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      startValue: startVal,
      currentValue: startVal, // Start at the baseline
      targetValue: parseFloat(newGoal.targetValue),
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString()
    };

    setGoals([...goals, goal]);
    setIsAdding(false);
    setNewGoal({ title: "", startValue: "", targetValue: "", unit: "kg", deadline: "" });
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const startEdit = (goal: WorkoutGoal) => {
    setEditingId(goal.id);
    setEditValue(goal.currentValue.toString());
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      setGoals(goals.map(g => g.id === id ? { ...g, currentValue: val } : g));
    }
    setEditingId(null);
  };

  const getProgress = (start: number, current: number, target: number) => {
    // Prevent division by zero if start == target
    if (start === target) return 100;
    
    // Calculate progress based on range
    const range = target - start;
    const gained = current - start;
    
    // Allow progress to be 0 or negative if they regressed, but cap at 100 visually
    const percent = (gained / range) * 100;
    
    return Math.min(100, Math.max(0, percent));
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="border-b border-gray-200 pb-4">
        <h2
          className="text-2xl font-extrabold tracking-tight mb-1"
          style={{ color: PT_RED }}
        >
          Panther Workouts
        </h2>
        <p className="text-sm text-gray-500">
          Access training portals and track personal performance goals.
        </p>
      </div>

      {/* --- EXTERNAL APPS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Output Sports Card */}
        <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 relative flex flex-col h-full">
            <div className="absolute top-0 right-0 p-8 bg-gray-50 rounded-bl-full opacity-50 group-hover:bg-red-50 transition-colors">
                <Activity className="w-12 h-12 text-gray-300 group-hover:text-red-300" />
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-md text-white">
                    <Activity className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Output Sports Hub</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">
                    View your complete athlete profile, velocity-based training data, readiness trends, and historical performance reports.
                </p>

                <div className="space-y-3">
                    <a 
                        href="https://hub.outputsports.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                        style={{ backgroundColor: PT_RED }}
                    >
                        Launch Output Hub
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>

        {/* TrainHeroic Card */}
        <div className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-lg border border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col h-full text-white">
            <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-bl-full group-hover:bg-white/10 transition-colors">
                <Smartphone className="w-12 h-12 text-gray-600 group-hover:text-gray-400" />
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                    <Smartphone className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">TrainHeroic</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-1">
                    Access your daily assigned strength & conditioning workouts, log your weights, and track your PRs.
                </p>

                <div className="space-y-3">
                    <a 
                        href="https://athlete.trainheroic.com/#/training"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-slate-900 bg-white shadow-md hover:bg-gray-100 active:scale-95 transition-all"
                    >
                        Launch App
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
      </div>

      {/* --- GOALS SECTION --- */}
      <div className="pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              My Goals
            </h3>
            <p className="text-xs text-gray-500">Track your progress toward specific targets.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? "Cancel" : "Add New Goal"}
          </button>
        </div>

        {/* ADD GOAL FORM */}
        {isAdding && (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Set a New Target</h4>
            <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Goal Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Increase Bench Press" 
                  className="w-full rounded-xl border-gray-300 text-sm p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={newGoal.title}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Starting Baseline (Current)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 90" 
                  className="w-full rounded-xl border-gray-300 text-sm p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={newGoal.startValue}
                  onChange={e => setNewGoal({...newGoal, startValue: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Target Goal</label>
                <input 
                  type="number" 
                  placeholder="e.g. 100" 
                  className="w-full rounded-xl border-gray-300 text-sm p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={newGoal.targetValue}
                  onChange={e => setNewGoal({...newGoal, targetValue: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Unit</label>
                <select 
                  className="w-full rounded-xl border-gray-300 text-sm p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={newGoal.unit}
                  onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                  <option value="reps">reps</option>
                  <option value="secs">secs</option>
                  <option value="m">meters</option>
                  <option value="cm">cm</option>
                  <option value="%">%</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Target Date (Optional)</label>
                <input 
                  type="date" 
                  className="w-full rounded-xl border-gray-300 text-sm p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={newGoal.deadline}
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <button 
                  type="submit"
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-md"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* GOALS LIST */}
        {goals.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No goals set yet.</p>
            <p className="text-xs text-gray-400">Click "Add New Goal" to start tracking.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const startVal = goal.startValue || 0; // fallback for legacy data
            const progress = getProgress(startVal, goal.currentValue, goal.targetValue);
            const daysLeft = getDaysLeft(goal.deadline);
            const isCompleted = goal.currentValue >= goal.targetValue;

            return (
              <div key={goal.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{goal.title}</h4>
                    {daysLeft !== null && !isCompleted && (
                      <div className={`text-xs mt-1 flex items-center gap-1 ${daysLeft < 7 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                      </div>
                    )}
                    {isCompleted && (
                      <div className="text-xs mt-1 flex items-center gap-1 text-green-600 font-bold">
                        <Check className="w-3 h-3" /> Goal Achieved!
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      {editingId === goal.id ? (
                         <div className="flex items-center gap-1">
                           <input 
                              type="number" 
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm font-bold"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                           />
                           <button onClick={() => saveEdit(goal.id)} className="bg-green-100 p-1 rounded hover:bg-green-200 text-green-700">
                              <Check className="w-3 h-3" />
                           </button>
                           <button onClick={() => setEditingId(null)} className="bg-gray-100 p-1 rounded hover:bg-gray-200 text-gray-500">
                              <X className="w-3 h-3" />
                           </button>
                         </div>
                      ) : (
                        <>
                          <span className="text-2xl font-extrabold text-gray-900">{goal.currentValue}</span>
                          <span className="text-xs text-gray-500 font-medium mb-1">{goal.unit}</span>
                          {!isCompleted && (
                            <button 
                                onClick={() => startEdit(goal)} 
                                className="text-gray-300 hover:text-blue-500 mb-1 ml-1"
                                title="Update Progress"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-right">
                         <div className="text-xs text-gray-400">Target: <span className="font-bold text-gray-700">{goal.targetValue} {goal.unit}</span></div>
                         <div className="text-[10px] text-gray-300">Start: {startVal} {goal.unit}</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : progress > 66 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {!isCompleted && editingId !== goal.id && (
                    <button 
                        onClick={() => startEdit(goal)}
                        className="w-full text-center text-xs font-bold text-blue-600 bg-blue-50 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <TrendingUp className="w-3 h-3" /> Log Progress
                    </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PantherWorkouts;
