import React from 'react';

interface IntroCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const IntroCard: React.FC<IntroCardProps> = ({ icon, title, content }) => {
  return (
    <div className="bg-gray-900 border border-green-500/20 rounded-lg p-6 backdrop-blur-sm bg-opacity-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-green-400">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="text-green-400/80 leading-relaxed">{content}</p>
    </div>
  );
};

export default IntroCard;