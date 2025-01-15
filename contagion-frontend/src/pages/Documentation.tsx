import React from 'react';
import IntroSection from '../components/IntroSection/IntroSection';
import DocSection from '../components/Documentation/DocSection';

function Documentation() {
  return (
    <div className="p-6">
      <IntroSection />
      <DocSection />
    </div>
  );
}

export default Documentation;