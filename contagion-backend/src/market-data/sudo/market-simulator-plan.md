# Crypto Market Simulator System Plan

## Overview
A simulation system to accurately replicate cryptocurrency market behavior from 0 to 50M market cap, focusing on matching SolanaTracker's data format and characteristics for seamless virus behavior testing.

## Core Components Integration

### 1. Market Data Format Alignment
Match SolanaTracker's response structure:
```javascript
{
    token: {
        name: string,
        symbol: string,
        mint: string,
        decimals: number
    },
    pools: [{
        liquidity: { quote: number, usd: number },
        price: { quote: number, usd: number },
        marketCap: { quote: number, usd: number },
        txns: {
            buys: number,
            sells: number,
            total: number,
            volume: number
        }
    }],
    events: {
        "1m": { priceChangePercentage: number },
        "5m": { priceChangePercentage: number },
        "15m": { priceChangePercentage: number },
        "1h": { priceChangePercentage: number },
        "24h": { priceChangePercentage: number }
    }
}
```

### 2. Market Growth Stages
Using `market-growth-stages.js` for lifecycle simulation:

#### Growth Phases
1. **LAUNCH** (0-10K MC)
   - High volatility (50-90%)
   - Micro orders dominant
   - Wide spreads (10%)
   - Rapid price changes

2. **EARLY_GROWTH** (10K-100K MC)
   - High-medium volatility (30-70%)
   - Mix of micro and normal orders
   - Moderate spreads (5%)
   - Growing liquidity

3. **VIRAL** (100K-1M MC)
   - Variable volatility (40-80%)
   - Increased order frequency
   - Tightening spreads (3%)
   - Peak trading activity

4. **ESTABLISHMENT** (1M-10M MC)
   - Medium volatility (20-50%)
   - Larger order sizes
   - Tighter spreads (2%)
   - Stabilizing patterns

5. **MATURATION** (10M-50M MC)
   - Lower volatility (10-30%)
   - Institutional-size orders
   - Tight spreads (1%)
   - Steady growth

### 3. Order Generation System
Using `stage-based-order-generator.js`:

#### Order Types
1. **Micro Orders**
   - Size: Stage minimum * 0.3
   - Frequency: High in early stages
   - Impact: Minimal price movement

2. **Normal Orders**
   - Size: Stage average
   - Frequency: Consistent throughout
   - Impact: Moderate price movement

3. **Whale Orders**
   - Size: Stage maximum * 3
   - Frequency: Increases in later stages
   - Impact: Significant price movement

### 4. Market Events System

#### Event Types
1. **Price Surge**
   - Trigger: Multiple whale buys
   - Duration: 5-15 minutes
   - Effect: Sharp price increase
   - Virus Response: BURST pattern

2. **Volume Spike**
   - Trigger: High frequency trading
   - Duration: 10-30 minutes
   - Effect: Increased liquidity
   - Virus Response: VECTOR pattern

3. **Volatility Event**
   - Trigger: Rapid price swings
   - Duration: 15-45 minutes
   - Effect: Price uncertainty
   - Virus Response: BURST pattern

### 5. Performance Metrics

#### Real-time Calculations
1. **Volatility**
   ```javascript
   calculateVolatility(events) {
       const changes = Object.values(events)
           .map(e => Math.abs(e.priceChangePercentage));
       return changes.reduce((a, b) => a + b, 0) / changes.length;
   }
   ```

2. **Volume**
   ```javascript
   calculateVolume(pools) {
       return pools[0]?.txns?.volume || 0;
   }
   ```

3. **Market Cap**
   ```javascript
   calculateMarketCap(pools) {
       return pools[0]?.marketCap?.usd || 0;
   }
   ```

### 6. Integration with Virus System

#### Market-to-Virus Mappings
1. **Volume → Spread Radius**
   - Higher volume = Larger spread radius
   - Scale: 0.5 to 5.0 base radius

2. **Volatility → Growth Multiplier**
   - Higher volatility = Faster growth
   - Scale: 0.1x to 5.0x multiplier

3. **Price Action → Spawn Triggers**
   - Price surge > 5% = BURST pattern
   - Volume spike > $1M = VECTOR pattern
   - Volatility > 10% = BURST pattern

## Implementation Phases

### Phase 1: Core Simulation (Week 1)
- [ ] Implement market stages system
- [ ] Set up order generation
- [ ] Create basic price discovery

### Phase 2: Event System (Week 2)
- [ ] Add market events
- [ ] Implement volatility calculation
- [ ] Create realistic order matching

### Phase 3: Integration (Week 3)
- [ ] Match SolanaTracker format
- [ ] Connect to virus system
- [ ] Add monitoring tools

### Phase 4: Testing & Tuning (Week 1-2)
- [ ] Run full lifecycle tests
- [ ] Fine-tune parameters
- [ ] Validate virus responses

## Testing Scenarios

### 1. Launch Phase Test
```javascript
// Simulate token launch
const simulator = new MarketSimulator({
    initialPrice: 0.0001,
    initialMarketCap: 2000,
    stage: 'LAUNCH'
});
```

### 2. Growth Phase Test
```javascript
// Test viral growth phase
simulator.setStage('VIRAL', {
    targetMarketCap: 500000,
    timeScale: '1h'
});
```

### 3. Event Response Test
```javascript
// Trigger market events
simulator.triggerEvent('PRICE_SURGE', {
    magnitude: 2.5,  // 250% increase
    duration: '15m'
});
```

## Success Metrics
1. Accurate price discovery
2. Realistic volume distribution
3. Natural stage progression
4. Matching virus behavior
5. Performance stability 

## Control System Integration

### Current Control Capabilities
Based on our dev-server.js implementation:

1. **Virus Parameter Controls**
   - Growth Multiplier (0.1 - 5.0)
   - Point Generation Rate (0.01 - 1.0)
   - Spread Radius (0.1 - 2.0)
   - Base Radius (5 - 30)
   - Color Intensity (0.1 - 1.0)
   - Intensity (0.1 - 1.0)

2. **Spawn Controls**
   - Manual spawn at coordinates
   - Pattern selection (NORMAL, VECTOR, BURST)
   - Location validation (-180° to 180° longitude, -90° to 90° latitude)

3. **System Controls**
   - Start/Stop simulation
   - Reset functionality
   - Boost/Suppress virus spread
   - Toggle auto-cycle

4. **Real-time Monitoring**
   - Total points tracking
   - Active spores count
   - Coverage percentage
   - Individual spore details
     - Position
     - Pattern type
     - Age
     - Points generated
     - Coverage area

### Market Control Extensions
Building on existing controls, we'll add:

1. **Market Stage Controls**
   ```javascript
   POST /api/simulation/control
   {
       action: 'market_stage_update',
       stage: 'VIRAL',
       params: {
           volatility: 0.6,
           orderFrequency: 'HIGH',
           spreadPercentage: 0.03
       }
   }
   ```

2. **Event Injection**
   ```javascript
   POST /api/simulation/control
   {
       action: 'market_event',
       type: 'PRICE_SURGE',
       params: {
           magnitude: 2.5,
           duration: 900000  // 15 minutes in ms
       }
   }
   ```

3. **Order Generation Controls**
   ```javascript
   POST /api/simulation/control
   {
       action: 'market_order',
       type: 'WHALE_BUY',
       params: {
           size: 50000,
           impact: 'HIGH'
       }
   }
   ```

4. **Market-Virus Coupling Controls**
   ```javascript
   POST /api/simulation/control
   {
       action: 'market_virus_sensitivity',
       params: {
           volumeToSpreadMultiplier: 1.5,
           volatilityToGrowthMultiplier: 2.0,
           priceToSpawnThreshold: 0.05
       }
   }
   ``` 