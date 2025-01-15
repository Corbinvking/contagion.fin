import React from 'react';
import { Info, Users, Route } from 'lucide-react';
import DocCard from './DocCard';
import SocialLinks from './SocialLinks';
import RoadmapTimeline from './RoadmapTimeline';

const DocSection = () => {
  return (
    <div className="mt-12 p-4 space-y-12">
      {/* How Is This Working */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Info className="w-6 h-6" />
          <h2 className="text-2xl font-bold">How Is This Working?</h2>
        </div>
        <div className="bg-gray-900 border border-green-500/20 rounded-lg p-6 backdrop-blur-sm bg-opacity-50">
          <p className="text-green-400/80 leading-relaxed mb-4">
            CONTAGION.IO operates on a unique blockchain-based virus simulation protocol:
          </p>
          <ul className="list-disc list-inside space-y-2 text-green-400/80">
            <li>Virus strains are represented as unique NFTs on the blockchain</li>
            <li>Each mutation increases token value through proof-of-infection</li>
            <li>Real-time tracking of infection vectors and mutation rates</li>
            <li>Automated smart contracts handle strain evolution and token distribution</li>
          </ul>
        </div>
      </div>

      {/* Socials */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Socials</h2>
        </div>
        <SocialLinks />
      </div>

      {/* Roadmap */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Route className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Roadmap</h2>
        </div>
        <RoadmapTimeline />
      </div>
    </div>
  );
};

export default DocSection;