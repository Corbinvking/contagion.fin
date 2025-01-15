import React, { useState, useEffect } from 'react';
import { Activity, Bug, TestTube, LineChart, BookOpen, Menu, X, Wallet } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import NavItem from './NavItem';
import StatusIndicator from './StatusIndicator';
import AuthModal from '../AuthModal';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setIsAuthModalOpen(true);
      setIsMenuOpen(false); // Close mobile menu when opening auth modal
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="relative">
        <header className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Bug className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-3xl font-black tracking-[0.2em] font-['Inter']">
              CONTA<span className="text-primary">GION</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Auth Button - Always visible */}
            <button
              onClick={handleAuthClick}
              className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 
                       text-primary rounded-lg transition-colors text-sm sm:text-base"
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                {user ? 'Sign Out' : 'Connect Wallet'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-text-secondary hover:text-text p-2
                       active:bg-card/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <NavItem to="/" icon={<Activity className="w-5 h-5" />} label="Stream" />
            <NavItem to="/metrics" icon={<LineChart className="w-5 h-5" />} label="Metrics" />
            <NavItem to="/virus-insights" icon={<TestTube className="w-5 h-5" />} label="Virus Insights" />
            <NavItem to="/docs" icon={<BookOpen className="w-5 h-5" />} label="Docs" />
            <StatusIndicator />
          </nav>
        </header>

        {/* Mobile Navigation Menu */}
        <div className={`
          lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40
          transition-opacity duration-200 ease-in-out
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <nav className={`
            fixed inset-x-0 top-[73px] bg-card border-b border-border
            transform transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}
          `}>
            <div className="flex flex-col p-4 gap-3">
              <NavItem 
                to="/" 
                icon={<Activity className="w-5 h-5" />} 
                label="Stream" 
                className="py-3"
              />
              <NavItem 
                to="/metrics" 
                icon={<LineChart className="w-5 h-5" />} 
                label="Metrics" 
                className="py-3"
              />
              <NavItem 
                to="/virus-insights" 
                icon={<TestTube className="w-5 h-5" />} 
                label="Virus Insights" 
                className="py-3"
              />
              <NavItem 
                to="/docs" 
                icon={<BookOpen className="w-5 h-5" />} 
                label="Docs" 
                className="py-3"
              />
              <div className="pt-3 border-t border-border">
                <StatusIndicator />
              </div>
            </div>
          </nav>
        </div>

        <main className="h-[calc(100vh-4rem)]">
          {children}
        </main>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Layout;