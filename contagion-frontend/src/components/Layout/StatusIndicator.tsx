import React from 'react';
import { Activity } from 'lucide-react';

const StatusIndicator = () => {
  return (
    <div className="flex items-center gap-2 ml-4">
      <Activity className="w-5 h-5 text-primary animate-pulse" />
      <span className="text-sm text-text-secondary">LIVE</span>
    </div>
  );
};

export default StatusIndicator;