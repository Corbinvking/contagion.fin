import React, { useEffect, useState } from 'react';

const LiveStream = () => {
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-card border border-border overflow-hidden">
      {isConnecting ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm sm:text-base text-text-secondary animate-pulse">Connecting to simulation...</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm sm:text-base text-text-muted">Waiting for simulation data...</p>
        </div>
      )}
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,247,195,0.1)_1px,_transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>
      
      {/* Scan Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,_rgba(0,247,195,0.05)_50%)] bg-[length:100%_4px] animate-scan pointer-events-none"></div>
    </div>
  );
};

export default LiveStream;