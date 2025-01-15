import React from 'react';
import { AlertCircle } from 'lucide-react';

interface NewsItemProps {
  text: string;
}

const NewsItem: React.FC<NewsItemProps> = ({ text }) => (
  <div className="flex items-center gap-2 text-green-400/80 whitespace-nowrap">
    <AlertCircle className="w-4 h-4" />
    <span>{text}</span>
  </div>
)

export default NewsItem;