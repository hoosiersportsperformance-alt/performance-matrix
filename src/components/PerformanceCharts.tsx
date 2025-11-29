import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ReferenceLine
} from 'recharts';
import { PerformanceHistory } from '../types';

interface AthleteHistoryChartProps {
  data: PerformanceHistory[];
  title: string;
  unit: string;
  color: string;
}

export const AthleteHistoryChart: React.FC<AthleteHistoryChartProps> = ({ data, title, unit, color }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
        No historical data available for {title}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">{title} Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              minTickGap={30}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              unit={` ${unit}`}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
              itemStyle={{ fontSize: '12px', color: color }}
              formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, title]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3} 
              dot={{ r: 3, fill: color, strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ComparisonData {
  name: string;
  value: number;
}

interface TeamAggregateChartProps {
  data: ComparisonData[];
  metricLabel: string;
  unit: string;
}

export const TeamAggregateChart: React.FC<TeamAggregateChartProps> = ({ data, metricLabel, unit }) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const average = data.reduce((acc, curr) => acc + curr.value, 0) / (data.length || 1);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Team Analysis: {metricLabel}</h3>
         <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
             Avg: <span className="font-bold">{average.toFixed(1)} {unit}</span>
         </div>
      </div>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
            <XAxis type="number" hide domain={[0, 'auto']} />
            <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }} 
                width={100}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip 
               cursor={{ fill: '#f9fafb' }}
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="value" fill="#C63527" radius={[0, 4, 4, 0]} barSize={20}>
            </Bar>
            <ReferenceLine x={average} stroke="#374151" strokeDasharray="3 3" label={{ position: 'top', value: 'AVG', fontSize: 10, fill: '#374151' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};