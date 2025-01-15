import React from 'react';
import { Coins, TrendingUp, Zap } from 'lucide-react';

const PumpBox = () => {
  return (
    <a 
      href="https://pump.fun" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-gradient-to-r from-green-500/10 to-green-500/20 border border-green-500/30 
                 rounded-lg p-6 hover:border-green-500/50 transition-all hover:transform hover:-translate-y-1
                 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coins className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="text-xl font-bold mb-1">Join the CONTAGION Revolution</h3>
            <p className="text-green-400/70">Get early access to our token pre-sale</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <Zap className="w-5 h-5" />
        </div>
      </div>
    </a>
  );
};

export default PumpBox;