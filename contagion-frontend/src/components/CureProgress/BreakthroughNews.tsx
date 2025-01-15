import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface BreakthroughNewsProps {
  currentBreakthrough: string;
  nextBreakthrough: string;
}

const BreakthroughNews: React.FC<BreakthroughNewsProps> = ({ 
  currentBreakthrough, 
  nextBreakthrough 
}) => {
  return (
    <div className="space-y-4">
      <motion.div 
        className="bg-card/50 border border-primary/20 rounded-lg p-4 relative overflow-hidden"
        animate={{
          boxShadow: [
            "0 0 0 rgba(0,247,195,0.1)",
            "0 0 20px rgba(0,247,195,0.2)",
            "0 0 0 rgba(0,247,195,0.1)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Background Pulse Effect */}
        <motion.div
          className="absolute inset-0 bg-primary/5"
          animate={{
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-semibold">Latest Breakthrough</h3>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={currentBreakthrough}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-text-secondary"
            >
              {currentBreakthrough}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="bg-card/30 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-text-secondary mb-2">
          <motion.div 
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <h3 className="font-semibold">Next Milestone</h3>
        </div>
        <p className="text-text-secondary/80">{nextBreakthrough}</p>
      </div>
    </div>
  );
};

export default BreakthroughNews;