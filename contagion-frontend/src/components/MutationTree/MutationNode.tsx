import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Bug, Lightbulb, Lock } from 'lucide-react';
import { MutationType } from './types';

interface MutationNodeProps {
  mutation: MutationType;
  isSelected: boolean;
  isConnected: boolean;
  onClick: () => void;
  color?: string;
  isMobile?: boolean;
}

const MutationNode: React.FC<MutationNodeProps> = ({
  mutation,
  isSelected,
  isConnected,
  onClick,
  color = '#00F7C3',
  isMobile = false
}) => {
  const icons = {
    transmission: Wind,
    symptom: Bug,
    ability: Lightbulb,
  };

  const Icon = icons[mutation.type];
  const isLocked = mutation.prerequisites?.length > 0 && !isConnected;

  // Adjust sizes for mobile
  const nodeSize = isMobile ? 40 : 50;
  const iconSize = isMobile ? 16 : 20;
  const fontSize = isMobile ? 8 : 10;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ 
        left: `${mutation.position.x}px`, 
        top: `${mutation.position.y}px`,
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
    >
      {/* Background hexagon */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id={`glow-${mutation.id}`}>
            <stop offset="0%" stopColor={color.replace('rgb', 'rgba').replace(')', ', 0.3)')} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Constant glow effect */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#glow-${mutation.id})`}
          className="animate-pulse"
        />

        {/* Hexagon shape */}
        <path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          style={{
            stroke: color,
            fill: isSelected ? `${color}33` : `${color}1A`,
          }}
          strokeWidth="2"
          className="animate-pulse"
        />
      </svg>

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isLocked ? (
          <Lock style={{ width: iconSize, height: iconSize, color }} />
        ) : (
          <Icon style={{ 
            width: iconSize, 
            height: iconSize, 
            color
          }} />
        )}
      </div>

      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span style={{ 
          fontSize: `${fontSize}px`, 
          color: `${color}`,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}>
          {mutation.name}
        </span>
      </div>
    </motion.div>
  );
};

export default MutationNode;