import React from 'react';
import MutationTree from '../../MutationTree/MutationTree';
import { MutationType } from '../../MutationTree/types';

const abilityMutations: MutationType[] = [
  {
    id: 'resist1',
    name: 'Drug Resistance I',
    description: 'Basic resistance to medical treatments',
    type: 'ability',
    icon: 'shield',
    effects: ['Reduced cure effectiveness', '+10% resistance'],
    stats: { infectivity: 5, severity: 2, lethality: 0 },
    position: { x: 250, y: 100 }
  },
  {
    id: 'resist2',
    name: 'Drug Resistance II',
    description: 'Enhanced resistance to treatments',
    type: 'ability',
    icon: 'shield',
    effects: ['Major cure resistance', '+20% resistance'],
    stats: { infectivity: 8, severity: 4, lethality: 1 },
    prerequisites: ['resist1'],
    position: { x: 350, y: 150 }
  },
  {
    id: 'cold1',
    name: 'Cold Resistance',
    description: 'Survives in cold climates',
    type: 'ability',
    icon: 'cold',
    effects: ['Cold climate survival', '+15% cold resistance'],
    stats: { infectivity: 10, severity: 0, lethality: 0 },
    position: { x: 150, y: 150 }
  },
  {
    id: 'heat1',
    name: 'Heat Resistance',
    description: 'Survives in hot climates',
    type: 'ability',
    icon: 'heat',
    effects: ['Heat climate survival', '+15% heat resistance'],
    stats: { infectivity: 10, severity: 0, lethality: 0 },
    position: { x: 200, y: 200 }
  },
  {
    id: 'genetic1',
    name: 'Genetic Hardening',
    description: 'Improved genetic stability',
    type: 'ability',
    icon: 'dna',
    effects: ['Mutation stability', '+15% cure resistance'],
    stats: { infectivity: 5, severity: 3, lethality: 0 },
    position: { x: 300, y: 200 }
  },
  {
    id: 'shield1',
    name: 'Viral Shield',
    description: 'Protects against immune system',
    type: 'ability',
    icon: 'shield',
    effects: ['Immune evasion', '+18% resistance'],
    stats: { infectivity: 12, severity: 5, lethality: 1 },
    position: { x: 400, y: 200 }
  },
  {
    id: 'extreme1',
    name: 'Extreme Bioaerosol',
    description: 'Advanced environmental survival',
    type: 'ability',
    icon: 'extreme',
    effects: ['Universal climate survival', '+25% resistance'],
    stats: { infectivity: 15, severity: 6, lethality: 2 },
    prerequisites: ['cold1', 'heat1'],
    position: { x: 450, y: 250 }
  },
  {
    id: 'adapt1',
    name: 'Rapid Adaptation',
    description: 'Quick environmental adaptation',
    type: 'ability',
    icon: 'adapt',
    effects: ['Fast mutation rate', '+20% adaptation'],
    stats: { infectivity: 10, severity: 4, lethality: 0 },
    position: { x: 250, y: 250 }
  },
  {
    id: 'evolve1',
    name: 'Genetic Evolution',
    description: 'Enhanced genetic capabilities',
    type: 'ability',
    icon: 'dna',
    effects: ['Advanced mutations', '+15% evolution rate'],
    stats: { infectivity: 8, severity: 3, lethality: 0 },
    position: { x: 150, y: 300 }
  },
  {
    id: 'ultimate1',
    name: 'Ultimate Evolution',
    description: 'Peak viral evolution',
    type: 'ability',
    icon: 'ultimate',
    effects: ['Maximum adaptation', '+30% all stats'],
    stats: { infectivity: 20, severity: 8, lethality: 3 },
    prerequisites: ['extreme1', 'adapt1'],
    position: { x: 350, y: 300 }
  },
  {
    id: 'stealth1',
    name: 'Stealth Proteins',
    description: 'Masks virus from immune detection',
    type: 'ability',
    icon: 'ability',
    effects: ['Reduced immune detection', '+25% infection time'],
    stats: { infectivity: 15, severity: 0, lethality: 0 },
    position: { x: -300, y: -150 }
  },
  {
    id: 'mutate1',
    name: 'Rapid Mutation',
    description: 'Increases mutation frequency',
    type: 'ability',
    icon: 'ability',
    effects: ['Faster evolution', '+20% mutation rate'],
    stats: { infectivity: 10, severity: 5, lethality: 0 },
    position: { x: 300, y: -150 }
  },
  {
    id: 'dormancy1',
    name: 'Viral Dormancy',
    description: 'Virus can remain dormant',
    type: 'ability',
    icon: 'ability',
    effects: ['Long-term survival', '+30% reinfection rate'],
    stats: { infectivity: 20, severity: 10, lethality: 0 },
    prerequisites: ['stealth1'],
    position: { x: 0, y: 50 }
  }
];

const AbilitiesView: React.FC<{ onMutationSelect: (mutation: MutationType | null) => void }> = ({ onMutationSelect }) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <MutationTree
          mutations={abilityMutations}
          onMutationSelect={onMutationSelect}
          color="rgb(168, 85, 247)" // Purple color for abilities
        />
      </div>
    </div>
  );
};

export default AbilitiesView;