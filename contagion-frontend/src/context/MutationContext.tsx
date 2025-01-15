import React, { createContext, useContext, useState, useEffect } from 'react';

interface MutationContextType {
  pressure: number;
  isGlowing: boolean;
  triggerGrowth: boolean;
}

const MutationContext = createContext<MutationContextType>({
  pressure: 25,
  isGlowing: false,
  triggerGrowth: false
});

export const MutationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pressure, setPressure] = useState(25);
  const [isGlowing, setIsGlowing] = useState(false);
  const [triggerGrowth, setTriggerGrowth] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPressure(prev => {
        if (prev >= 100) {
          // Start glowing effect
          setIsGlowing(true);
          // Trigger tree growth
          setTriggerGrowth(true);
          
          // Reset after animation
          setTimeout(() => {
            setIsGlowing(false);
            setTriggerGrowth(false);
            setPressure(25); // Reset pressure
          }, 1000);
          
          return 100;
        }
        return prev + Math.random() * 2;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <MutationContext.Provider value={{ pressure, isGlowing, triggerGrowth }}>
      {children}
    </MutationContext.Provider>
  );
};

export const useMutation = () => useContext(MutationContext);