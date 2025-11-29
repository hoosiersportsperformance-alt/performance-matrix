import React, { useState, useEffect } from 'react';
import { generateNutritionPlan, NutritionInputs } from '../services/nutritionService';
import { NutritionPlan, InBodyEntry } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Utensils, Zap, Loader2, Sparkles, AlertCircle, CheckCircle2, Target } from 'lucide-react';

const PT_RED = "#C63527";
const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Protein (Blue), Carbs (Green), Fat (Yellow)

interface NutritionCalculatorProps {
  inBodyData?: InBodyEntry[];
}

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ inBodyData = [] }) => {
  const [inputs, setInputs] = useState<NutritionInputs>({
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    activity: 'Moderately Active (Train 3-5 days/week)',
    goal: 'Maintain Performance',
    currentDiet: '',
    notes: ''
  });

  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill weight from InBody data if available
  useEffect(() => {
    if (inBodyData && inBodyData.length > 0 && !inputs.weight) {
        // Try to find the most recent entry
        const sorted = [...inBodyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = sorted[0];
        if (latest && latest.weight) {
            setInputs(prev => ({ ...prev, weight: latest.weight.toString() }));
        }
    }
  }, [inBodyData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.age || !inputs.weight) {
        setError("Please enter at least Age and Weight.");
        return;
    }
    
    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const result = await generateNutritionPlan(inputs);
      setPlan(result);
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = plan ? [
    { name: 'Protein', value: plan.protein },
    { name: 'Carbs', value: plan.carbs },
    { name: 'Fats', value: plan.fats },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
            <h2
            className="text-2xl font-extrabold tracking-tight mb-1"
            style={{ color: PT_RED }}
            >
            Fueling Targets & Calculator
            </h2>
            <p className="text-sm text-gray-500">
            Generate personalized macro targets and AI-powered nutrition advice based on your current biometrics.
            </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
            <Sparkles className="w-4 h-4" />
            Powered by Gemini
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT FORM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Athlete Profile
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={inputs.age}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="e.g. 17"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={inputs.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    name="weight"
                    value={inputs.weight}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="e.g. 165"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Height</label>
                  <input
                    type="text"
                    name="height"
                    value={inputs.height}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="e.g. 5'10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Activity Level</label>
                <select
                  name="activity"
                  value={inputs.activity}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  <option>Sedentary (Little to no exercise)</option>
                  <option>Lightly Active (Train 1-3 days/week)</option>
                  <option>Moderately Active (Train 3-5 days/week)</option>
                  <option>Very Active (Train 6-7 days/week)</option>
                  <option>Extra Active (Two-a-days, physical job)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Goal</label>
                <select
                  name="goal"
                  value={inputs.goal}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  <option>Weight Loss / Cut</option>
                  <option>Maintain Performance</option>
                  <option>Muscle Gain / Bulk</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Current Diet / Typical Day <span className="text-red-500">*</span>
                </label>
                <p className="text-[10px] text-gray-400 mb-2">
                    Describe what you eat in a day. The AI will use this to identify what you're doing well vs. what to fix.
                </p>
                <textarea
                  name="currentDiet"
                  value={inputs.currentDiet}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g. I skip breakfast, usually eat a turkey sandwich and chips for lunch. Dinner is whatever my parents cook. I drink mostly water but have soda after practice."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Special Restrictions <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={inputs.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g. Vegetarian, nut allergy..."
                />
              </div>

              <div className="pt-2">
                {error && (
                    <div className="mb-3 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {error}
                    </div>
                )}
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none hover:brightness-110"
                    style={{ backgroundColor: PT_RED }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Habits...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" /> Generate Plan & Feedback
                        </>
                    )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RESULTS AREA */}
        <div className="lg:col-span-7 space-y-6">
            {!plan && !loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-8">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold mb-2">Ready to Optimize?</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        Enter your biometric data and <span className="font-semibold text-gray-700">current eating habits</span> on the left. The AI will analyze your routine to provide a tailored strategy.
                    </p>
                </div>
            )}

            {loading && (
                 <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                    <p className="text-sm text-gray-500 animate-pulse">Analyzing metabolic needs & diet habits...</p>
                 </div>
            )}

            {plan && (
                <>
                    {/* Top Level Calories */}
                    <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full opacity-10 filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Target</span>
                                <div className="text-5xl font-extrabold mt-1">{plan.calories.toLocaleString()}</div>
                                <span className="text-sm text-gray-400">kcal / day</span>
                            </div>
                            <div className="text-right max-w-[200px]">
                                <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Strategy</div>
                                <p className="text-sm text-gray-300 leading-snug">
                                    {inputs.goal}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Macro Cards */}
                        <div className="grid grid-cols-1 gap-4">
                             <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                                 <div>
                                     <div className="text-xs font-bold text-blue-600 uppercase">Protein</div>
                                     <div className="text-2xl font-bold text-gray-900">{plan.protein}g</div>
                                 </div>
                                 <div className="h-2 w-12 bg-blue-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-500 w-3/4"></div>
                                 </div>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                                 <div>
                                     <div className="text-xs font-bold text-green-600 uppercase">Carbohydrates</div>
                                     <div className="text-2xl font-bold text-gray-900">{plan.carbs}g</div>
                                 </div>
                                 <div className="h-2 w-12 bg-green-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-green-500 w-2/3"></div>
                                 </div>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm flex items-center justify-between">
                                 <div>
                                     <div className="text-xs font-bold text-yellow-600 uppercase">Fats</div>
                                     <div className="text-2xl font-bold text-gray-900">{plan.fats}g</div>
                                 </div>
                                 <div className="h-2 w-12 bg-yellow-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-yellow-500 w-1/3"></div>
                                 </div>
                             </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center justify-center">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Macro Distribution</h4>
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            formatter={(value: number) => [`${value}g`, '']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            iconType="circle" 
                                            height={36} 
                                            iconSize={8}
                                            formatter={(value) => <span className="text-xs font-medium text-gray-600 ml-1">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* AI Feedback Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Winning Habits */}
                        <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <h4 className="font-bold text-green-900 text-sm uppercase tracking-wide">Winning Habits</h4>
                            </div>
                            <ul className="space-y-3">
                                {plan.strengths.map((point, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-green-800 leading-snug">
                                        <span className="block mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Focus Areas */}
                        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-5 h-5 text-orange-600" />
                                <h4 className="font-bold text-orange-900 text-sm uppercase tracking-wide">Focus Areas</h4>
                            </div>
                            <ul className="space-y-3">
                                {plan.improvements.map((point, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-orange-800 leading-snug">
                                        <span className="block mt-1 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default NutritionCalculator;