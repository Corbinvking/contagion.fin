import React, { useState } from 'react';
import TabNav from '../components/VirusInsights/TabNav';
import InfoPanel from '../components/VirusInsights/InfoPanel';
import DiseaseView from '../components/VirusInsights/TabViews/DiseaseView';
import TransmissionView from '../components/VirusInsights/TabViews/TransmissionView';
import SymptomsView from '../components/VirusInsights/TabViews/SymptomsView';
import AbilitiesView from '../components/VirusInsights/TabViews/AbilitiesView';
import { MutationType } from '../components/MutationTree/types';

const VirusInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Disease');
  const [selectedMutation, setSelectedMutation] = useState<MutationType | null>(null);

  const getColorsByTab = () => {
    switch (activeTab) {
      case 'Transmission':
        return { 
          text: 'text-red-400', 
          bg: 'bg-red-900/50', 
          hover: 'hover:bg-red-900/70',
          vote: { colorClass: 'text-red-400', bgClass: 'bg-red-900/50', hoverClass: 'hover:bg-red-900/70' }
        };
      case 'Symptoms':
        return { 
          text: 'text-yellow-400', 
          bg: 'bg-yellow-900/50', 
          hover: 'hover:bg-yellow-900/70',
          vote: { colorClass: 'text-yellow-400', bgClass: 'bg-yellow-900/50', hoverClass: 'hover:bg-yellow-900/70' }
        };
      case 'Abilities':
        return { 
          text: 'text-purple-400', 
          bg: 'bg-purple-900/50', 
          hover: 'hover:bg-purple-900/70',
          vote: { colorClass: 'text-purple-400', bgClass: 'bg-purple-900/50', hoverClass: 'hover:bg-purple-900/70' }
        };
      default:
        return { 
          text: 'text-primary', 
          bg: 'bg-primary/10', 
          hover: 'hover:bg-primary/20',
          vote: { colorClass: 'text-primary', bgClass: 'bg-primary/10', hoverClass: 'hover:bg-primary/20' }
        };
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedMutation(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Disease':
        return (
          <div className="flex-1 relative overflow-hidden">
            <DiseaseView />
          </div>
        );
      case 'Transmission':
      case 'Symptoms':
      case 'Abilities':
        return (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3 sm:gap-6 p-3 sm:p-6 overflow-hidden">
            {/* Info Panel */}
            <div className="lg:space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] lg:max-h-none">
              <InfoPanel 
                selectedMutation={selectedMutation} 
                voteColors={getColorsByTab().vote}
              />
            </div>

            {/* Main Content Area */}
            <div className="relative bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
              {activeTab === 'Transmission' && <TransmissionView onMutationSelect={setSelectedMutation} />}
              {activeTab === 'Symptoms' && <SymptomsView onMutationSelect={setSelectedMutation} />}
              {activeTab === 'Abilities' && <AbilitiesView onMutationSelect={setSelectedMutation} />}
            </div>
          </div>
        );
      default:
        return <DiseaseView />;
    }
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col">
      <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
      {renderTabContent()}
    </div>
  );
};

export default VirusInsights;