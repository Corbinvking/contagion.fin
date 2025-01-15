import React, { useEffect, useState } from 'react';

const NEWS_ITEMS = [
  "BREAKING: Virus mutation rate increases by 150% in Asia region",
  "Token price surges as infection spreads to major tech hubs",
  "New security protocol breached in under 2.5 seconds",
  "Blockchain nodes reporting unprecedented infection vectors",
  "AI predicts virus evolution pattern: Beta strain imminent"
];

const NewsTicker: React.FC = () => {
  const [items, setItems] = useState(NEWS_ITEMS);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gray-900 border border-green-500/20 rounded-lg overflow-hidden">
      <div className="relative flex items-center h-8 sm:h-12 overflow-hidden">
        <div className="absolute flex gap-8 animate-scroll">
          {items.map((item, index) => (
            <div 
              key={`${item}-${index}`}
              className="flex items-center gap-2 text-green-400/80 whitespace-nowrap px-4 text-sm sm:text-base"
            >
              <span className="text-green-500">|</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;