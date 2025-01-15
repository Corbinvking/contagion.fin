import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, className = '' }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full
        ${isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-text-secondary hover:text-text hover:bg-card/50'
        } ${className}`
      }
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default NavItem;