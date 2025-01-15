import React from 'react';
import { Dna, Zap } from 'lucide-react';
import { useMutation } from '../../context/MutationContext';

const MutationMeter: React.FC = () => {
  const { pressure, isGlowing } = useMutation();
  const progress = (pressure / 100) * 100;

  return (
    <div className="card hover:border-border/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-primary" />
          <span className="text-sm text-text-secondary">Mutation Pressure</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-primary">{Math.round(pressure)}/100</span>
          <Zap className={`w-4 h-4 ${pressure > 80 ? 'text-primary animate-pulse' : 'text-text-secondary'}`} />
        </div>
      </div>

      <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out
            ${isGlowing ? 'animate-glow' : ''}`}
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-y-0 w-px bg-primary/50" style={{ left: '80%' }} />
      </div>
    </div>
  );
}

export default MutationMeter;