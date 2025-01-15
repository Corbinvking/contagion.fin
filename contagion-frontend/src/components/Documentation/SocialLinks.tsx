import React from 'react';
import { Twitter, Github, MessageCircle, Globe } from 'lucide-react';

const socialLinks = [
  {
    icon: <Twitter className="w-5 h-5" />,
    name: 'Twitter',
    handle: '@contagion_io',
    url: 'https://twitter.com/contagion_io'
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    name: 'Discord',
    handle: 'Join our community',
    url: 'https://discord.gg/contagion'
  },
  {
    icon: <Github className="w-5 h-5" />,
    name: 'GitHub',
    handle: 'contagion-protocol',
    url: 'https://github.com/contagion-protocol'
  },
  {
    icon: <Globe className="w-5 h-5" />,
    name: 'Blog',
    handle: 'Latest updates',
    url: 'https://blog.contagion.io'
  }
];

const SocialLinks = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {socialLinks.map((social, index) => (
        <a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-gray-900 border border-green-500/20 rounded-lg p-4
                     hover:border-green-500/40 transition-all hover:-translate-y-1
                     backdrop-blur-sm bg-opacity-50"
        >
          <div className="text-green-400">
            {social.icon}
          </div>
          <div>
            <div className="font-bold">{social.name}</div>
            <div className="text-sm text-green-400/60">{social.handle}</div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;