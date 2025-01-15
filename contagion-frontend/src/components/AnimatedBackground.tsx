import React from 'react';
import PulsingPoint from './PulsingPoint';

const AnimatedBackground = () => {
  // Generate more random points with varying sizes
  const points = Array.from({ length: 15 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    size: 20 + Math.random() * 40 // Random size between 20 and 60
  }));

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Base grid */}
      <div className="absolute inset-0 grid-background opacity-30" />
      
      {/* Pulsing points */}
      {points.map((point, i) => (
        <PulsingPoint 
          key={i}
          x={point.x}
          y={point.y}
          delay={point.delay}
          size={point.size}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;