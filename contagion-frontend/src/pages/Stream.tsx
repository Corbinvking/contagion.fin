import React from 'react';
import LiveStream from '../components/LiveStream';
import NewsTicker from '../components/NewsTicker/NewsTicker';
import { Outlet } from 'react-router-dom';

function Stream() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative min-h-0">
        <LiveStream />
        <div className="absolute inset-0 overflow-auto">
          <Outlet />
        </div>
      </div>
      <div className="p-2 sm:p-4">
        <NewsTicker />
      </div>
    </div>
  );
}

export default Stream;