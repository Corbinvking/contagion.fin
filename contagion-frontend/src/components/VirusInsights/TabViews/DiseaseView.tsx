import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '../../../context/MutationContext';
import StatsBar from '../StatsBar';
import { ChevronDown, ChevronUp, Dna, HelpCircle } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  active: boolean;
  label: string;
  type?: 'transmission' | 'symptom' | 'ability';
  votes?: {
    transmission: number;
    symptom: number;
    ability: number;
  };
  isPlaceholder?: boolean;
}

const generateTreeNodes = (): Node[] => {
  const nodes: Node[] = [
    // Root node
    { 
      id: '1', 
      x: 50, 
      y: 90, 
      active: true, 
      label: 'Base Strain',
      type: undefined 
    }
  ];

  // Generate 6 levels of nodes (total 18 nodes excluding root)
  for (let level = 1; level <= 5; level++) {
    const nodesInLevel = 3 + level; // 4, 5, 6, 7, 8 nodes per level
    const yPosition = 90 - (level * 15); // Move up by 15% each level
    
    for (let i = 0; i < nodesInLevel; i++) {
      const xSpacing = 80 / (nodesInLevel + 1); // Distribute across 80% of width
      const xPosition = 10 + ((i + 1) * xSpacing);
      
      nodes.push({
        id: `${level}-${i}`,
        x: xPosition,
        y: yPosition,
        active: false,
        label: '???',
        isPlaceholder: true,
        votes: {
          transmission: Math.floor(Math.random() * 50) + 10,
          symptom: Math.floor(Math.random() * 50) + 10,
          ability: Math.floor(Math.random() * 50) + 10
        }
      });
    }
  }

  return nodes;
};

const DiseaseView = () => {
  const { triggerGrowth } = useMutation();
  const [showStats, setShowStats] = useState(false);
  const [nodes, setNodes] = useState<Node[]>(generateTreeNodes());
  const [stats, setStats] = useState({
    infectivity: 15,
    severity: 5,
    lethality: 0
  });

  const getVoteColor = (type: 'transmission' | 'symptom' | 'ability') => {
    switch (type) {
      case 'transmission': return '#FF4976';
      case 'symptom': return '#FFB800';
      case 'ability': return '#00F7C3';
    }
  };

  const getWinningType = (votes?: Node['votes']) => {
    if (!votes) return null;
    const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] as 'transmission' | 'symptom' | 'ability';
  };

  useEffect(() => {
    if (triggerGrowth) {
      setNodes(prevNodes => {
        const inactiveNodes = prevNodes.filter(node => !node.active && node.votes);
        if (inactiveNodes.length === 0) return prevNodes;

        // Find the lowest level inactive node
        const nextNode = inactiveNodes.reduce((lowest, current) => {
          const lowestY = parseFloat(lowest.y.toString());
          const currentY = parseFloat(current.y.toString());
          return currentY > lowestY ? current : lowest;
        });

        const winningType = getWinningType(nextNode.votes);
        
        setStats(prev => ({
          infectivity: Math.min(100, prev.infectivity + Math.floor(Math.random() * 5) + 1),
          severity: Math.min(100, prev.severity + Math.floor(Math.random() * 3) + 1),
          lethality: Math.min(100, prev.lethality + Math.floor(Math.random() * 2))
        }));

        return prevNodes.map(node =>
          node.id === nextNode.id ? { 
            ...node, 
            active: true,
            type: winningType,
            label: `${winningType?.charAt(0).toUpperCase()}${winningType?.slice(1)} Node`,
            isPlaceholder: false
          } : node
        );
      });
    }
  }, [triggerGrowth]);

  return (
    <div className="relative w-full h-full">
      {/* Collapsible Stats Panel */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden"
          animate={{ height: showStats ? 'auto' : '48px' }}
        >
          <div 
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => setShowStats(!showStats)}
          >
            <div className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Virus Statistics</h3>
            </div>
            {showStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 pb-4 space-y-4"
              >
                <StatsBar 
                  label="Infectivity" 
                  value={stats.infectivity} 
                  maxValue={100}
                  color="bg-red-400"
                />
                <StatsBar 
                  label="Severity" 
                  value={stats.severity} 
                  maxValue={100}
                  color="bg-yellow-400"
                />
                <StatsBar 
                  label="Lethality" 
                  value={stats.lethality} 
                  maxValue={100}
                  color="bg-purple-400"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Disease Tree */}
      <svg className="w-full h-full">
        {/* Nodes */}
        {nodes.map((node) => (
          <motion.g key={node.id}>
            {/* Node Circle with Color Cycling for Unassigned Nodes */}
            {node.isPlaceholder ? (
              <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r="12"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  fill: [
                    getVoteColor('transmission'),
                    getVoteColor('symptom'),
                    getVoteColor('ability'),
                    getVoteColor('transmission')
                  ]
                }}
                transition={{
                  scale: { duration: 0.5 },
                  fill: { 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              />
            ) : (
              <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r="12"
                fill={node.type ? getVoteColor(node.type) : '#00F7C3'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
            
            {/* Node Icon */}
            {node.isPlaceholder && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <HelpCircle
                  className="w-4 h-4 text-text-secondary"
                  style={{
                    transform: `translate(${node.x - 2}%, ${node.y - 2}%)`
                  }}
                />
              </motion.g>
            )}

            {/* Node Label */}
            <text
              x={`${node.x}%`}
              y={`${node.y + 8}%`}
              textAnchor="middle"
              className="text-xs fill-current"
              style={{ fontSize: '0.7em' }}
            >
              {node.label}
            </text>

            {/* Pulse Effect for Active Nodes */}
            {!node.isPlaceholder && (
              <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r="16"
                fill="transparent"
                stroke={node.type ? getVoteColor(node.type) : '#00F7C3'}
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default DiseaseView;