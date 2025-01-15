import React from 'react';

interface PulsingPointProps {
  delay: number;
  x: number;
  y: number;
  size: number;
}

const PulsingPoint: React.FC<PulsingPointProps> = ({ delay, x, y, size }) => {
  return (
    <div 
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}vh`,
        height: `${size}vh`,
        animation: `pulse ${3 + Math.random()}s ease-in-out ${delay}s infinite`
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,0,0.15)_0%,_transparent_70%)]" />
    </div>
  );
};

export default PulsingPoint;