import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DocCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const DocCard: React.FC<DocCardProps> = ({ icon, title, description, link }) => {
  return (
    <a 
      href={link}
      className="block bg-gray-900 border border-green-500/20 rounded-lg p-6 
                 hover:border-green-500/40 transition-all hover:transform hover:-translate-y-1
                 backdrop-blur-sm bg-opacity-50"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-green-400">
          {icon}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-green-400/60">{description}</p>
    </a>
  );
};

export default DocCard;