import React, { useState } from 'react';
import MutationTree from '../../MutationTree/MutationTree';
import { MutationType } from '../../MutationTree/types';

const transmissionMutations: MutationType[] = [
  {
    id: 'air1',
    name: 'Air Transmission I',
    description: 'Disease can travel through air particles',
    type: 'transmission',
    icon: 'air',
    effects: ['Increased spread in urban areas', '+10% transmission'],
    stats: { infectivity: 10, severity: 0, lethality: 0 },
    position: { x: 250, y: 100 }
  },
  {
    id: 'air2',
    name: 'Air Transmission II',
    description: 'Enhanced airborne capabilities',
    type: 'transmission',
    icon: 'air',
    effects: ['Major boost to urban spread', '+20% transmission'],
    stats: { infectivity: 20, severity: 2, lethality: 0 },
    prerequisites: ['air1'],
    position: { x: 350, y: 150 }
  },
  {
    id: 'water1',
    name: 'Water Transmission',
    description: 'Spreads through water systems',
    type: 'transmission',
    icon: 'water',
    effects: ['Infects through water supply', '+15% transmission'],
    stats: { infectivity: 15, severity: 1, lethality: 0 },
    position: { x: 150, y: 150 }
  },
  {
    id: 'insect1',
    name: 'Insect Transmission',
    description: 'Insects can carry the disease',
    type: 'transmission',
    icon: 'insect',
    effects: ['Mosquito transmission', '+12% transmission'],
    stats: { infectivity: 12, severity: 1, lethality: 0 },
    position: { x: 200, y: 200 }
  },
  {
    id: 'animal1',
    name: 'Animal Transmission',
    description: 'Animals can spread the disease',
    type: 'transmission',
    icon: 'animal',
    effects: ['Bird transmission', '+15% transmission'],
    stats: { infectivity: 15, severity: 2, lethality: 0 },
    position: { x: 300, y: 200 }
  },
  {
    id: 'blood1',
    name: 'Blood Transmission',
    description: 'Spreads through blood contact',
    type: 'transmission',
    icon: 'blood',
    effects: ['Blood contact spread', '+18% transmission'],
    stats: { infectivity: 18, severity: 3, lethality: 1 },
    position: { x: 400, y: 200 }
  },
  {
    id: 'extreme1',
    name: 'Extreme Bioaerosol',
    description: 'Advanced airborne mutation',
    type: 'transmission',
    icon: 'extreme',
    effects: ['Extreme air transmission', '+25% transmission'],
    stats: { infectivity: 25, severity: 4, lethality: 2 },
    prerequisites: ['air2'],
    position: { x: 450, y: 250 }
  },
  {
    id: 'urban1',
    name: 'Urban Spread',
    description: 'Thrives in city environments',
    type: 'transmission',
    icon: 'urban',
    effects: ['City specialization', '+20% urban transmission'],
    stats: { infectivity: 20, severity: 2, lethality: 0 },
    position: { x: 250, y: 250 }
  },
  {
    id: 'rural1',
    name: 'Rural Spread',
    description: 'Spreads in rural areas',
    type: 'transmission',
    icon: 'rural',
    effects: ['Rural specialization', '+15% rural transmission'],
    stats: { infectivity: 15, severity: 1, lethality: 0 },
    position: { x: 150, y: 300 }
  },
  {
    id: 'extreme2',
    name: 'Extreme Resilience',
    description: 'Survives in any environment',
    type: 'transmission',
    icon: 'extreme',
    effects: ['Universal transmission', '+30% transmission'],
    stats: { infectivity: 30, severity: 5, lethality: 3 },
    prerequisites: ['extreme1'],
    position: { x: 350, y: 300 }
  },
  {
    id: 'fomite1',
    name: 'Fomite Transmission',
    description: 'Spreads through contaminated surfaces',
    type: 'transmission',
    icon: 'transmission',
    effects: ['Surface contamination', '+15% indirect transmission'],
    stats: { infectivity: 15, severity: 1, lethality: 0 },
    position: { x: -300, y: -150 }
  },
  {
    id: 'aerosol1',
    name: 'Aerosol Transmission',
    description: 'Enhanced droplet transmission',
    type: 'transmission',
    icon: 'transmission',
    effects: ['Improved air survival', '+18% transmission in humid climates'],
    stats: { infectivity: 18, severity: 2, lethality: 0 },
    position: { x: 300, y: -150 }
  },
  {
    id: 'zoonotic1',
    name: 'Zoonotic Transmission',
    description: 'Cross-species transmission',
    type: 'transmission',
    icon: 'transmission',
    effects: ['Animal reservoir', '+20% transmission diversity'],
    stats: { infectivity: 20, severity: 3, lethality: 1 },
    position: { x: 0, y: 50 }
  }
];

const TransmissionView: React.FC<{ onMutationSelect: (mutation: MutationType | null) => void }> = ({ onMutationSelect }) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <MutationTree
          mutations={transmissionMutations}
          onMutationSelect={onMutationSelect}
          color="rgb(255, 73, 118)" // Red color for transmission
        />
      </div>
    </div>
  );
};

export default TransmissionView;