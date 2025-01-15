import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, change }) => {
  const isPositive = change.startsWith('+');

  return (
    <div className="card hover:border-border/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{title}</span>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-2 text-text">{value}</div>
      <div className={`text-sm ${isPositive ? 'text-primary' : 'text-danger'}`}>
        {change} (24h)
      </div>
    </div>
  );
};

export default MetricCard;