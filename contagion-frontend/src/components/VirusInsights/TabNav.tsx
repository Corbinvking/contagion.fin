import React from 'react';

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNav: React.FC<TabNavProps> = ({ activeTab, onTabChange }) => {
  const getTabStyles = (tab: string) => {
    const baseStyles = "flex-none min-w-[120px] py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg font-semibold transition-colors whitespace-nowrap";
    
    if (activeTab !== tab) {
      return `${baseStyles} hover:bg-card/80 text-text-secondary hover:text-text`;
    }

    switch (tab) {
      case 'Transmission':
        return `${baseStyles} bg-red-900/50 text-red-400`;
      case 'Symptoms':
        return `${baseStyles} bg-yellow-900/50 text-yellow-400`;
      case 'Abilities':
        return `${baseStyles} bg-purple-900/50 text-purple-400`;
      default:
        return `${baseStyles} bg-primary/10 text-primary`;
    }
  };

  const tabs = ['Disease', 'Transmission', 'Symptoms', 'Abilities'];

  return (
    <div className="flex overflow-x-auto bg-card/50 backdrop-blur-sm rounded-t-lg scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={getTabStyles(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabNav;