import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import MutationNode from './MutationNode';
import { MutationType, MutationTreeProps } from './types';
import ParticleBackground from './ParticleBackground';
import VoteButton from '../VoteButton';

interface ExtendedMutationTreeProps extends MutationTreeProps {
  color?: string;
}

const MutationTree: React.FC<ExtendedMutationTreeProps> = ({ 
  mutations, 
  onMutationSelect,
  color = 'rgb(0, 247, 195)'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMutation, setSelectedMutation] = useState<MutationType | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMobile] = useState(window.innerWidth < 768);

  const handleMutationClick = useCallback((mutation: MutationType) => {
    setSelectedMutation(mutation);
    onMutationSelect(mutation);
  }, [onMutationSelect]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPan({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - startPan.x,
        y: e.touches[0].clientY - startPan.y
      });
    }
  }, [isDragging, startPan]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Get vote button colors based on mutation type
  const getVoteColors = (type: string) => {
    switch (type) {
      case 'transmission':
        return {
          colorClass: 'text-red-400',
          bgClass: 'bg-red-900/50',
          hoverClass: 'hover:bg-red-900/70'
        };
      case 'symptom':
        return {
          colorClass: 'text-yellow-400',
          bgClass: 'bg-yellow-900/50',
          hoverClass: 'hover:bg-yellow-900/70'
        };
      case 'ability':
        return {
          colorClass: 'text-purple-400',
          bgClass: 'bg-purple-900/50',
          hoverClass: 'hover:bg-purple-900/70'
        };
      default:
        return {
          colorClass: 'text-primary',
          bgClass: 'bg-primary/10',
          hoverClass: 'hover:bg-primary/20'
        };
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ParticleBackground color={color} />

      <div 
        className="absolute inset-0 transition-transform duration-200"
        style={{
          transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`
        }}
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none">
          {mutations.map(mutation =>
            mutation.prerequisites?.map(prereqId => {
              const prereq = mutations.find(m => m.id === prereqId);
              if (!prereq) return null;
              return (
                <line
                  key={`${mutation.id}-${prereqId}`}
                  x1={prereq.position.x}
                  y1={prereq.position.y}
                  x2={mutation.position.x}
                  y2={mutation.position.y}
                  stroke={color}
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
              );
            })
          )}
        </svg>

        {/* Mutation Nodes */}
        {mutations.map(mutation => (
          <MutationNode
            key={mutation.id}
            mutation={mutation}
            isSelected={selectedMutation?.id === mutation.id}
            isConnected={!selectedMutation || selectedMutation.id === mutation.id}
            onClick={() => handleMutationClick(mutation)}
            color={color}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Mobile Details Panel */}
      {isMobile && selectedMutation && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 transform"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold" style={{ color }}>
              {selectedMutation.name}
            </h3>
            <button 
              onClick={() => {
                setSelectedMutation(null);
                onMutationSelect(null);
              }}
              className="text-text-secondary hover:text-text"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            {selectedMutation.description}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <div className="text-xs text-text-secondary">Infectivity</div>
              <div className="text-red-400">+{selectedMutation.stats.infectivity}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-secondary">Severity</div>
              <div className="text-yellow-400">+{selectedMutation.stats.severity}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-secondary">Lethality</div>
              <div className="text-purple-400">+{selectedMutation.stats.lethality}</div>
            </div>
          </div>

          {/* Vote Button */}
          <VoteButton
            mutationId={selectedMutation.id}
            {...getVoteColors(selectedMutation.type)}
          />
        </motion.div>
      )}
    </div>
  );
};

export default MutationTree;