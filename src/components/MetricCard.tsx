
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number | null;
  sublabel?: string;
  icon?: LucideIcon;
  colorClass?: string; // e.g., "text-blue-600 bg-blue-50"
  borderClass?: string; // e.g., "border-blue-200"
}

const MetricCard: React.FC<MetricCardProps> = ({ 
    label, 
    value, 
    sublabel, 
    icon: Icon,
    colorClass = "text-gray-600 bg-gray-50",
    borderClass = "border-gray-200"
}) => {
  return (
    <div className={`bg-white rounded-3xl shadow-sm p-5 border-2 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 ${borderClass}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          {label}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight block">
          {value !== null && value !== undefined ? value : "--"}
        </span>
        {sublabel && (
          <span className="text-xs font-medium text-gray-400 mt-1 block">{sublabel}</span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
