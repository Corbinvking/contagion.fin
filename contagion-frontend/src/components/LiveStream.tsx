import React, { useEffect, useState, useCallback } from 'react';
import MapViewer from './MapViewer';

const LiveStream = () => {
  const [status, setStatus] = useState({
    isLoading: true,
    error: null as string | null,
    isConnected: false
  });

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/health');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          isLoading: false,
          error: null,
          isConnected: data.status === 'ok'
        });
      } else {
        throw new Error('Simulation server not responding');
      }
    } catch (err) {
      setStatus({
        isLoading: false,
        error: 'Unable to connect to simulation server',
        isConnected: false
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const renderContent = () => {
    if (status.error) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500">{status.error}</p>
            <button 
              onClick={() => {
                setStatus(prev => ({ ...prev, isLoading: true }));
                checkConnection();
              }}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    if (status.isLoading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary animate-pulse">Connecting to simulation...</p>
          </div>
        </div>
      );
    }

    return <MapViewer />;
  };

  return (
    <div className="absolute inset-0 bg-card border border-border overflow-hidden">
      {renderContent()}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,247,195,0.1)_1px,_transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,_rgba(0,247,195,0.05)_50%)] bg-[length:100%_4px] animate-scan pointer-events-none"></div>
    </div>
  );
};

export default LiveStream;