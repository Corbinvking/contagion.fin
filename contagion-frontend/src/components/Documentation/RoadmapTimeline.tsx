import React from 'react';

const roadmapItems = [
  {
    quarter: 'Q2 2024',
    title: 'Genesis Launch',
    items: [
      'Initial token distribution',
      'Core protocol deployment',
      'Basic mutation mechanics'
    ]
  },
  {
    quarter: 'Q3 2024',
    title: 'Evolution Update',
    items: [
      'Advanced mutation algorithms',
      'Cross-chain integration',
      'Community governance'
    ]
  },
  {
    quarter: 'Q4 2024',
    title: 'Ecosystem Expansion',
    items: [
      'Mobile app release',
      'Partnership program',
      'Enhanced visualization'
    ]
  },
  {
    quarter: 'Q1 2025',
    title: 'Mass Adoption',
    items: [
      'Layer 2 scaling solution',
      'NFT marketplace',
      'Developer SDK'
    ]
  }
];

const RoadmapTimeline = () => {
  return (
    <div className="space-y-6">
      {roadmapItems.map((item, index) => (
        <div 
          key={index}
          className="relative bg-gray-900 border border-green-500/20 rounded-lg p-6
                     backdrop-blur-sm bg-opacity-50"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-green-400 font-mono">{item.quarter}</span>
            <h3 className="text-xl font-bold">{item.title}</h3>
          </div>
          <ul className="list-disc list-inside space-y-2 text-green-400/80">
            {item.items.map((listItem, i) => (
              <li key={i}>{listItem}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default RoadmapTimeline;