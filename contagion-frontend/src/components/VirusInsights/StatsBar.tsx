import React from 'react';

interface StatsBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const StatsBar: React.FC<StatsBarProps> = ({ label, value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-text-secondary text-sm">{label}</span>
        <span className="text-sm font-mono">{value}</span>
      </div>
      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StatsBar;