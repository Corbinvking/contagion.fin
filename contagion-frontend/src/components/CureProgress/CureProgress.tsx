import React, { useState, useEffect } from 'react';
import CureFlask from './CureFlask';
import ProgressBar from './ProgressBar';
import BreakthroughNews from './BreakthroughNews';

const CureProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("12:00:00");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 0.1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3 sm:gap-6 p-3 sm:p-6 bg-card/30 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center justify-center gap-3 sm:gap-6">
        <CureFlask progress={progress} />
        <ProgressBar 
          progress={progress} 
          timeRemaining={timeRemaining} 
        />
      </div>
      
      <BreakthroughNews
        currentBreakthrough="Initial virus protein structure mapped successfully"
        nextBreakthrough="Analyzing virus transmission vectors and mutation patterns"
      />
    </div>
  );
};

export default CureProgress;