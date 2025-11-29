
import React, { useState } from 'react';
import { WellnessInputs } from '../types';
import { X, Moon, Activity, Zap, Frown, Smile, Brain } from 'lucide-react';

const PT_RED = "#C63527";

interface WellnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WellnessInputs) => void;
  isLoading: boolean;
}

const WellnessModal: React.FC<WellnessModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<WellnessInputs>({
    sleepHours: 8,
    soreness: 3,
    fatigue: 3,
    stress: 3,
    mood: 7,
    comments: ""
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof WellnessInputs, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderSlider = (label: string, field: keyof WellnessInputs, min: number, max: number, icon: React.ReactNode, lowLabel: string, highLabel: string) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          {icon} {label}
        </label>
        <span className="text-lg font-bold text-red-600 w-8 text-right">{formData[field]}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step="0.5"
        value={formData[field]}
        onChange={(e) => handleChange(field, parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
      />
      <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wide">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
             <h3 className="text-xl font-extrabold text-gray-900">Daily Wellness Log</h3>
             <p className="text-xs text-gray-500">Inputs for AI Readiness Score</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-2">
             
             {renderSlider("Sleep Hours", "sleepHours", 0, 12, <Moon className="w-4 h-4 text-indigo-500" />, "No Sleep", "Hibernation")}
             
             <div className="h-px bg-gray-100 my-4" />
             
             {renderSlider("Soreness", "soreness", 1, 10, <Activity className="w-4 h-4 text-orange-500" />, "No Pain", "Extreme Pain")}
             {renderSlider("Fatigue", "fatigue", 1, 10, <Zap className="w-4 h-4 text-yellow-500" />, "Fresh", "Exhausted")}
             
             <div className="h-px bg-gray-100 my-4" />

             {renderSlider("Stress", "stress", 1, 10, <Brain className="w-4 h-4 text-purple-500" />, "Zen", "Stressed Out")}
             {renderSlider("Mood", "mood", 1, 10, <Smile className="w-4 h-4 text-green-500" />, "Terrible", "Great")}

             <div className="mt-4">
                <label className="text-sm font-bold text-gray-700 block mb-2">Notes / Injuries</label>
                <textarea 
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Any specific pain or issues?"
                  value={formData.comments}
                  onChange={(e) => handleChange("comments", e.target.value)}
                />
             </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
            style={{ backgroundColor: PT_RED }}
          >
            {isLoading ? "Analyzing..." : "Calculate AI Readiness"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WellnessModal;
