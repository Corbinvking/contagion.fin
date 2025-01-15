import React from 'react';
import { motion } from 'framer-motion';

interface CureFlaskProps {
  progress: number;
}

const CureFlask: React.FC<CureFlaskProps> = ({ progress }) => {
  const bubbleCount = 8;
  const bubbles = Array.from({ length: bubbleCount });

  return (
    <div className="relative w-48 h-48">
      {/* Flask Container */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background Glow */}
        <defs>
          <radialGradient id="flaskGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,247,195,0.2)" />
            <stop offset="100%" stopColor="rgba(0,247,195,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#flaskGlow)" />

        {/* Flask Outline */}
        <path
          d="M35,20 L35,50 C35,70 25,75 25,85 C25,92.5 37.5,97.5 50,97.5 C62.5,97.5 75,92.5 75,85 C75,75 65,70 65,50 L65,20"
          fill="none"
          stroke="rgba(0,247,195,0.3)"
          strokeWidth="2"
        />
        {/* Flask Top */}
        <path
          d="M35,20 L65,20 M40,15 L60,15"
          stroke="rgba(0,247,195,0.3)"
          strokeWidth="2"
        />
        
        {/* Liquid Fill with Wave Effect */}
        <motion.path
          initial={{ d: "M35,85 C35,85 37.5,85 50,85 C62.5,85 65,85 65,85" }}
          animate={{
            d: [
              `M35,${85 - progress/2} C35,85 37.5,97.5 50,97.5 C62.5,97.5 65,85 65,${85 - progress/2}`,
              `M35,${85 - progress/2} C35,85 37.5,95.5 50,97.5 C62.5,99.5 65,85 65,${85 - progress/2}`,
              `M35,${85 - progress/2} C35,85 37.5,97.5 50,97.5 C62.5,97.5 65,85 65,${85 - progress/2}`
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          fill="rgba(0,247,195,0.2)"
        />

        {/* Shimmer Effect */}
        <motion.line
          x1="25"
          y1="85"
          x2="75"
          y2="85"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
            y: [-10, -30]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </svg>

      {/* Floating Bubbles */}
      {bubbles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/30"
          initial={{
            x: 40 + Math.random() * 20,
            y: 80,
            opacity: 0,
            scale: 0
          }}
          animate={{
            y: [80, 40 + Math.random() * 20],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Percentage Text with Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            textShadow: [
              "0 0 8px rgba(0,247,195,0.3)",
              "0 0 16px rgba(0,247,195,0.6)",
              "0 0 8px rgba(0,247,195,0.3)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-3xl font-bold text-primary"
        >
          {Math.round(progress)}%
        </motion.div>
      </div>
    </div>
  );
};

export default CureFlask;