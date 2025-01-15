import React from 'react';
import Version1MapView from './components/Version1MapView';

const App = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'absolute',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      <Version1MapView />
    </div>
  );
};

export default App;
