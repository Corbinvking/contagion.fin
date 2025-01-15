import React, { useState, useEffect } from 'react';
import { Dna } from 'lucide-react';
import CircularProgress from './CircularProgress';

const MUTATION_INTERVAL = 30000; // 30 seconds for demo purposes

const MutationTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(MUTATION_INTERVAL);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          // Reset timer when it reaches 0
          setIsActive(false);
          setTimeout(() => {
            setTimeLeft(MUTATION_INTERVAL);
            setIsActive(true);
          }, 1000);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const progress = (timeLeft / MUTATION_INTERVAL) * 100;
  const secondsLeft = Math.ceil(timeLeft / 1000);

  return (
    <div className="card hover:border-border/30 transition-colors relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <CircularProgress progress={progress} />
      </div>
      <div className="relative flex flex-col items-center justify-center h-[160px]">
        <div className="text-primary mb-2">
          <Dna className="w-6 h-6" />
        </div>
        <div className="text-sm text-text-secondary mb-1">Next Mutation In</div>
        <div className="text-2xl font-bold font-mono">
          {secondsLeft}s
        </div>
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="text-primary animate-pulse">Mutating...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MutationTimer;