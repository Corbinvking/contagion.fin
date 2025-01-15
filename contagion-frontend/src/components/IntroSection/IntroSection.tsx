import React from 'react';
import { Users, Info, Coins } from 'lucide-react';
import IntroCard from './IntroCard';
import PumpBox from './PumpBox';

const IntroSection = () => {
  return (
    <div className="mt-8 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <IntroCard
          icon={<Users className="w-6 h-6" />}
          title="Who We Are"
          content="We are a decentralized collective of cyber-security experts and blockchain developers pioneering the future of digital infection vectors. Our team combines expertise in virus propagation with blockchain technology to create the next generation of digital assets."
        />
        <IntroCard
          icon={<Info className="w-6 h-6" />}
          title="What Is This"
          content="CONTAGION.IO is a revolutionary platform that simulates and tracks digital virus mutations on the blockchain. Each strain represents a unique token, with value determined by its infection success rate and mutation characteristics."
        />
      </div>
      <PumpBox />
    </div>
  );
};

export default IntroSection;