import React from 'react';
import { Bitcoin, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, BarChart3 } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import MutationMeter from '../components/MutationMeter/MutationMeter';
import CureProgress from '../components/CureProgress/CureProgress';

function Dashboard() {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm p-3 sm:p-6 overflow-auto">
      {/* Token Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Token Price"
          value="$0.0045"
          icon={<Bitcoin className="text-primary" />}
          change="+12.5%"
        />
        <MetricCard
          title="Market Cap"
          value="$1.2M"
          icon={<TrendingUp className="text-primary" />}
          change="+8.3%"
        />
        <MetricCard
          title="24h Volume"
          value="$245.3K"
          icon={<BarChart3 className="text-primary" />}
          change="-5.2%"
        />
        <MetricCard
          title="Holders"
          value="1,234"
          icon={<Wallet className="text-primary" />}
          change="+25"
        />
      </div>

      {/* Trading Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
        <MetricCard
          title="Buy Orders"
          value="156"
          icon={<ArrowUpRight className="text-green-400" />}
          change="+23.4%"
        />
        <MetricCard
          title="Sell Orders"
          value="89"
          icon={<ArrowDownRight className="text-red-400" />}
          change="-15.2%"
        />
      </div>

      {/* Mutation Meter */}
      <div className="mt-3 sm:mt-4">
        <MutationMeter />
      </div>
      
      {/* Cure Progress */}
      <div className="mt-3 sm:mt-4">
        <CureProgress />
      </div>
    </div>
  );
}

export default Dashboard;