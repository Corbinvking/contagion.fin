import React from 'react';
import MutationTree from '../../MutationTree/MutationTree';
import { MutationType } from '../../MutationTree/types';

const symptomMutations: MutationType[] = [
  {
    id: 'cough1',
    name: 'Coughing',
    description: 'Causes infected to cough frequently',
    type: 'symptom',
    icon: 'cough',
    effects: ['Increased air transmission', '+10% infectivity'],
    stats: { infectivity: 10, severity: 5, lethality: 0 },
    position: { x: 250, y: 100 }
  },
  {
    id: 'sneeze1',
    name: 'Sneezing',
    description: 'Causes frequent sneezing',
    type: 'symptom',
    icon: 'sneeze',
    effects: ['Major air transmission boost', '+15% infectivity'],
    stats: { infectivity: 15, severity: 8, lethality: 0 },
    prerequisites: ['cough1'],
    position: { x: 350, y: 150 }
  },
  {
    id: 'nausea1',
    name: 'Nausea',
    description: 'Causes stomach discomfort',
    type: 'symptom',
    icon: 'nausea',
    effects: ['Water transmission boost', '+12% infectivity'],
    stats: { infectivity: 12, severity: 10, lethality: 0 },
    position: { x: 150, y: 150 }
  },
  {
    id: 'rash1',
    name: 'Rash',
    description: 'Causes skin irritation',
    type: 'symptom',
    icon: 'rash',
    effects: ['Contact transmission', '+8% infectivity'],
    stats: { infectivity: 8, severity: 5, lethality: 0 },
    position: { x: 200, y: 200 }
  },
  {
    id: 'insomnia1',
    name: 'Insomnia',
    description: 'Prevents restful sleep',
    type: 'symptom',
    icon: 'insomnia',
    effects: ['Reduced productivity', '+5% severity'],
    stats: { infectivity: 0, severity: 15, lethality: 0 },
    position: { x: 300, y: 200 }
  },
  {
    id: 'paranoia1',
    name: 'Paranoia',
    description: 'Causes mental instability',
    type: 'symptom',
    icon: 'paranoia',
    effects: ['Social disruption', '+20% severity'],
    stats: { infectivity: 5, severity: 20, lethality: 2 },
    position: { x: 400, y: 200 }
  },
  {
    id: 'hemorrhage1',
    name: 'Hemorrhaging',
    description: 'Causes internal bleeding',
    type: 'symptom',
    icon: 'hemorrhage',
    effects: ['Severe health impact', '+25% lethality'],
    stats: { infectivity: 5, severity: 25, lethality: 25 },
    prerequisites: ['paranoia1'],
    position: { x: 450, y: 250 }
  },
  {
    id: 'coma1',
    name: 'Coma',
    description: 'Causes loss of consciousness',
    type: 'symptom',
    icon: 'coma',
    effects: ['Critical condition', '+30% severity'],
    stats: { infectivity: 0, severity: 30, lethality: 15 },
    position: { x: 250, y: 250 }
  },
  {
    id: 'necrosis1',
    name: 'Necrosis',
    description: 'Causes tissue death',
    type: 'symptom',
    icon: 'necrosis',
    effects: ['Organ failure', '+35% lethality'],
    stats: { infectivity: 10, severity: 35, lethality: 35 },
    position: { x: 150, y: 300 }
  },
  {
    id: 'total1',
    name: 'Total Organ Failure',
    description: 'Complete system shutdown',
    type: 'symptom',
    icon: 'total',
    effects: ['Fatal condition', '+50% lethality'],
    stats: { infectivity: 0, severity: 50, lethality: 50 },
    prerequisites: ['hemorrhage1', 'coma1'],
    position: { x: 350, y: 300 }
  },
  {
    id: 'fever1',
    name: 'High Fever',
    description: 'Causes dangerous fever spikes',
    type: 'symptom',
    icon: 'symptom',
    effects: ['Temperature regulation disruption', '+15% severity'],
    stats: { infectivity: 5, severity: 15, lethality: 2 },
    position: { x: -300, y: -150 }
  },
  {
    id: 'seizure1',
    name: 'Seizures',
    description: 'Causes neurological symptoms',
    type: 'symptom',
    icon: 'symptom',
    effects: ['Brain function disruption', '+20% severity'],
    stats: { infectivity: 0, severity: 20, lethality: 5 },
    position: { x: 300, y: -150 }
  },
  {
    id: 'cytokine1',
    name: 'Cytokine Storm',
    description: 'Triggers severe immune response',
    type: 'symptom',
    icon: 'symptom',
    effects: ['Immune system overreaction', '+40% lethality'],
    stats: { infectivity: 5, severity: 40, lethality: 40 },
    prerequisites: ['fever1'],
    position: { x: 0, y: 50 }
  }
];

const SymptomsView: React.FC<{ onMutationSelect: (mutation: MutationType | null) => void }> = ({ onMutationSelect }) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <MutationTree
          mutations={symptomMutations}
          onMutationSelect={onMutationSelect}
          color="rgb(255, 184, 0)" // Yellow color for symptoms
        />
      </div>
    </div>
  );
};

export default SymptomsView;