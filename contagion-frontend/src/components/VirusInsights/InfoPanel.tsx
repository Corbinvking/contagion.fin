import React from 'react';
import { MutationType } from '../MutationTree/types';
import VoteButton from '../VoteButton';

interface InfoPanelProps {
  selectedMutation: MutationType | null;
  voteColors: {
    colorClass: string;
    bgClass: string;
    hoverClass: string;
  };
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedMutation, voteColors }) => {
  if (!selectedMutation) {
    return (
      <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg">
        <p className="text-text-secondary text-center">
          Select a mutation to view details and vote
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg space-y-6">
      {/* Mutation Name and Description */}
      <div>
        <h3 className={`text-xl font-bold mb-2 ${voteColors.colorClass}`}>
          {selectedMutation.name}
        </h3>
        <p className="text-text-secondary">
          {selectedMutation.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Infectivity</div>
          <div className="text-red-400 text-xl font-bold">
            +{selectedMutation.stats.infectivity}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Severity</div>
          <div className="text-yellow-400 text-xl font-bold">
            +{selectedMutation.stats.severity}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Lethality</div>
          <div className="text-purple-400 text-xl font-bold">
            +{selectedMutation.stats.lethality}
          </div>
        </div>
      </div>

      {/* Effects */}
      <div>
        <h4 className="text-sm text-text-secondary mb-2">Effects</h4>
        <div className="flex flex-wrap gap-2">
          {selectedMutation.effects.map((effect, index) => (
            <span
              key={index}
              className={`text-xs ${voteColors.bgClass} ${voteColors.colorClass} px-2 py-1 rounded`}
            >
              {effect}
            </span>
          ))}
        </div>
      </div>

      {/* Vote Button */}
      <VoteButton
        mutationId={selectedMutation.id}
        {...voteColors}
      />
    </div>
  );
};

export default InfoPanel;