import React from 'react';
import MutationTree from '../components/MutationTree/MutationTree';
import { MutationType } from '../components/MutationTree/types';

const mockMutations: MutationType[] = [
  {
    id: 'air1',
    name: 'Air Transmission I',
    type: 'transmission',
    description: 'Enables airborne transmission through dust particles',
    icon: 'air',
    effects: [
      'Increased transmission in arid environments',
      'Enhanced spread through ventilation systems',
      'Improved survival in air particles'
    ],
    stats: {
      infectivity: 15,
      severity: 5,
      lethality: 0
    },
    position: { x: 200, y: 200 }
  },
  {
    id: 'air2',
    name: 'Air Transmission II',
    type: 'transmission',
    description: 'Advanced airborne capabilities with extended survival',
    icon: 'air',
    effects: [
      'Significantly increased transmission range',
      'Extended survival time in air',
      'Enhanced resistance to environmental factors'
    ],
    stats: {
      infectivity: 25,
      severity: 8,
      lethality: 2
    },
    prerequisites: ['air1'],
    position: { x: 400, y: 200 }
  },
  // Add more mutations as needed
];

function Mutations() {
  const handleMutationSelect = (mutation: MutationType) => {
    console.log('Selected mutation:', mutation);
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm">
      <MutationTree
        mutations={mockMutations}
        onMutationSelect={handleMutationSelect}
      />
    </div>
  );
}

export default Mutations;