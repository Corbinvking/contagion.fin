import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Skull } from 'lucide-react';
import { MutationType } from './types';

interface MutationDetailsProps {
  mutation: MutationType;
}

const MutationDetails: React.FC<MutationDetailsProps> = ({ mutation }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">{mutation.name}</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>{mutation.stats.infectivity}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Skull className="w-4 h-4 text-primary" />
            <span>{mutation.stats.lethality}</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-text-secondary mb-3">
        {mutation.description}
      </div>

      <div className="flex gap-1 flex-wrap">
        {mutation.effects.map((effect, index) => (
          <span
            key={index}
            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mb-1"
          >
            {effect}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default MutationDetails;