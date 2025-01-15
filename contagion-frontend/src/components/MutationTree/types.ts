export interface MutationType {
  id: string;
  name: string;
  description: string;
  type: 'transmission' | 'symptom' | 'ability';
  icon: string;
  effects: string[];
  stats: {
    infectivity: number;
    severity: number;
    lethality: number;
  };
  prerequisites?: string[];
  position: { x: number; y: number };
}

export interface MutationNodeProps {
  mutation: MutationType;
  isSelected: boolean;
  isConnected: boolean;
  onClick: (mutation: MutationType) => void;
}

export interface MutationTreeProps {
  mutations: MutationType[];
  onMutationSelect: (mutation: MutationType) => void;
}