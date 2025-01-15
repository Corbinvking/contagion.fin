import React from 'react';
import { createRoot } from 'react-dom/client';
import Version1MapView from './components/Version1MapView';
import './styles/main.css';

// Development controls wrapper
const DevControls = ({ children }) => {
  const isSimulationServer = process.env.VITE_APP_ENV !== 'frontend';
  
  // Only show dev controls in simulation environment
  if (!isSimulationServer) {
    return children;
  }

  return (
    <div className="dev-environment">
      <div className="dev-controls">
        <h3>Development Controls</h3>
        <div className="control-section">
          <h4>Map Controls</h4>
          {/* Map controls will be added here */}
        </div>
        <div className="control-section">
          <h4>Route System</h4>
          {/* Route controls will be added here */}
        </div>
        <div className="control-section">
          <h4>Virus System</h4>
          {/* Virus controls will be added here */}
        </div>
      </div>
      <div className="simulation-view">
        {children}
      </div>
    </div>
  );
};

// Main App
const App = () => {
  return (
    <DevControls>
      <Version1MapView />
    </DevControls>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
