import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  timeRemaining: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, timeRemaining }) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-text-secondary">
        <span>Cure Progress</span>
        <span className="font-mono">{timeRemaining}</span>
      </div>
      <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden">
        {/* Base Progress */}
        <motion.div 
          className="absolute inset-y-0 left-0 bg-primary/50"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Animated Gradient Overlay */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(0,247,195,0.3) 50%, 
              transparent 100%
            )`,
            width: '50%',
          }}
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Pulse Effect at Progress Edge */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
          style={{ left: `${progress}%` }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0.2, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;