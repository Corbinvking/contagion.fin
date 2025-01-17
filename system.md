# Contagion System Documentation

## System Overview
Contagion is a real-time virus spread simulation platform that integrates cryptocurrency market data with interactive visualization. The system consists of a Node.js/Express backend for simulation logic and a React/TypeScript frontend for visualization.

## Architecture

### Backend Components

#### 1. Core Systems

##### Simulation Server (`src/server/SimulationServer.js`)
Primary WebSocket server managing:
- Client connections and state broadcasting
- Real-time message handling
- Simulation control commands
- Population impact tracking

##### Geospatial System (`src/components/GeospatialSpawnController.js`)
Manages geographical spread mechanics:
- Region-based point management
- Nearest neighbor calculations
- Population density tracking
- Urban/rural spread differentiation

```javascript
class GeospatialSpawnController {
    constructor(predefinedPoints) {
        this.points = predefinedPoints;
        this.kdTree = null;
        this.activeRegions = new Set();
    }
    // Methods for geographical control
}
```

##### Population Data Structure (`src/data/regions/`)
Regional data organization:
- Six major regions (North America, Europe, Asia, Africa, South America, Oceania)
- Population statistics per region
- Urban/rural distribution
- Major city coordinates

```javascript
const REGION_POPULATIONS = {
    'asia': {
        population: 4_700_000_000,           // ~57.3% of global
        populationDensity: 95,               // people per km²
        urbanPopulationPercent: 51,          // % living in urban areas
        majorCitiesPercent: 35               // % living in major cities
    },
    // ... other regions
};
```

##### Virus System (`src/components/VirusSystem.js`)
Controls virus behavior and population impact:
```javascript
const GROWTH_PATTERNS = {
    NORMAL: {
        tickRate: 2000,
        spreadDistance: 0.5,
        spawnProbability: 0.7,
        color: [255, 0, 0]
    },
    VECTOR: {
        tickRate: 1500,
        spreadDistance: 1.5,
        spawnProbability: 0.5,
        color: [255, 165, 0]
    },
    BURST: {
        tickRate: 1000,
        spreadDistance: 2.5,
        spawnProbability: 0.9,
        color: [139, 0, 0]
    }
};

// Population tracking
class VirusSystem {
    constructor() {
        this.populationStats = {
            totalInfected: 0,
            infectedByRegion: {},
            affectedPoints: new Set(),
            populationDensity: new Map()
        };
    }
}
```

#### 2. Population Impact Tracking

##### Regional Statistics
- Total population: 8.2 billion (2024 estimate)
- Regional distribution tracking
- Urban/rural spread differentiation
- Population density impact

##### Infection Calculations
```javascript
// Calculate infected population
calculateInfectedPopulation(infectedPoints, regionKey = null)

// Get population density at point
getPopulationDensityAtPoint(lat, lng)

// Get affected population
getPopulationAffectedByPoint(point, radius)
```

##### Visualization Adjustments
- Point size scaled by population density
- Color intensity based on infection impact
- Urban center highlighting
- Regional boundary visualization

#### 3. Data Organization

##### Regional Data Structure
```
src/data/regions/
├── index.js           # Central data management
├── north-america.js   # North American points
├── europe.js         # European points
├── asia.js           # Asian points
├── africa.js         # African points
├── south-america.js  # South American points
└── oceania.js        # Oceanian points
```

##### Population Metrics
- Global population tracking
- Regional distribution
- Urban/rural ratios
- Population density maps

##### Route System (`src/components/RouteSystem.js`)
Manages transportation network:
- Air and sea route definitions
- Vehicle movement simulation
- Path and endpoint visualization
class RouteSystem {
constructor() {
this.vehicles = [];
this.routes = [];
this.lastUpdate = Date.now();
}
// ... route management
}

##### Market Data Integration (`src/market-data/real/`)
Real-time cryptocurrency market data integration:

###### SolanaTrackerService (`soltracker.js`)
Handles REST API calls to SolanaTracker API:
```javascript
class SolanaTrackerService {
    constructor(apiKey) {
        this.baseUrl = 'https://data.solanatracker.io';
        this.cacheTimeout = 300000; // 5 minutes cache
    }
    async processTokenData(tokenAddress) {
        // Fetches token data, price, market cap, and metrics
        // Returns: { price, marketCap, volume, volatility, transactions }
    }
}
```

###### Market Data Stream (`MarketDataStream.js`)
Manages continuous market data updates:
```javascript
class MarketDataStream extends EventEmitter {
    constructor(options = {}) {
        this.interval = options.interval || 60000; // Default 1 minute
        this.windowSize = options.windowSize || 5; // Keep last 5 data points
    }
    // Emits 'data' events with market metrics and trends
}
```

###### Market To Virus Translator (`MarketToVirusTranslator.js`)
Translates market data into virus behavior:
```javascript
class MarketToVirusTranslator {
    translateMarketData(marketData) {
        // Returns virus parameters based on market conditions:
        // - spreadRadius: Based on trading volume
        // - growthMultiplier: Based on volatility
        // - shouldSpawnNew: Based on price/volume/volatility thresholds
        // - pattern: NORMAL, BURST, or VECTOR based on market events
    }
}
```

## Communication Flow

### Market Data Integration Flow
```
A[SolanaTracker API] -->|REST| B[SolanaTrackerService]
B -->|Cached Data| C[MarketDataStream]
C -->|Events| D[MarketToVirusTranslator]
D -->|Virus Parameters| E[VirusSystem]
```

Key Events:
- SolanaTrackerService: Token data and metrics (5m cache)
- MarketDataStream: Real-time updates (10-60s intervals)
- MarketToVirusTranslator: Parameter conversion
- VirusSystem: Behavior updates

Market Triggers:
- Price Surge: Spawns BURST pattern spores
- High Volume: Spawns VECTOR pattern spores
- High Volatility: Spawns BURST pattern spores

#### 2. Controllers

##### Simulation Controller (`src/controllers/SimulationController.js`)
Orchestrates simulation components:
class SimulationController {
constructor() {
this.routeSystem = null;
this.virusSystem = null;
this.isRunning = false;
this.subscribers = new Set();
}
// ... simulation control
}

### Frontend Components

#### 1. Application Structure

##### Entry Point (`src/main.tsx`)

reateRoot(document.getElementById('root')!).render(
<StrictMode>
<App />
</StrictMode>
);

##### Core Application (`src/App.tsx`)

function App() {
return (
<AuthProvider>
<MutationProvider>
<BrowserRouter>
<Layout>
<Routes>
<Route path="/" element={<Stream />}>
<Route path="metrics" element={<Dashboard />} />
<Route path="virus-insights" element={<VirusInsights />} />
</Route>
<Route path="/docs" element={<Documentation />} />
</Routes>
</Layout>
</BrowserRouter>
</MutationProvider>
</AuthProvider>
);
}

#### 2. Visualization Components

##### LiveStream (`src/components/LiveStream.tsx`)
Manages backend connectivity:
interface ConnectionState {
isLoading: boolean;
error: string | null;
isConnected: boolean;
}

##### MapViewer (`src/components/MapViewer.tsx`)
Handles visualization layers:
interface SimulationState {
layers: {
route?: {
paths?: { data: RouteData[] };
endpoints?: { data: EndpointData[] };
vehicles?: { data: VehicleData[] };
};
virus?: {
points?: { data: VirusPoint[] };
};
};
timestamp?: number;
}


## Communication Flow

### Market Data Integration Flow
```
A[SolanaTracker API] -->|REST| B[SolanaTrackerService]
B -->|Cached Data| C[MarketDataStream]
C -->|Events| D[MarketToVirusTranslator]
D -->|Virus Parameters| E[VirusSystem]
```

Key Events:
- SolanaTrackerService: Token data and metrics (5m cache)
- MarketDataStream: Real-time updates (10-60s intervals)
- MarketToVirusTranslator: Parameter conversion
- VirusSystem: Behavior updates

### WebSocket Protocol

A[Frontend Client] -->|WebSocket| B[SimulationServer]
B -->|State Updates| A
B -->|Control Messages| C[SimulationController]
C -->|Updates| D[VirusSystem]
C -->|Updates| E[RouteSystem]


### HTTP Endpoints
- `GET /health`: System status
- `POST /api/simulation/control`: Control commands
- `GET /api/simulation/state`: State retrieval
- `GET /api/market-data/current`: Latest market data
- `GET /api/market-data/trends`: Market trends analysis

## Development Setup

### Backend

cd contagion-backend
npm install
npm run dev


### Frontend

cd contagion-frontend
npm install
npm run dev


### Environment Configuration


# Backend (.env)
PORT=8080
NODE_ENV=development


# Frontend (.env)
VITE_BACKEND_WS_URL=ws://localhost:8080
VITE_BACKEND_HTTP_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key


## File Structure

contagion/
├── backend/
│ └── src/
│   ├── server/
│   │ └── SimulationServer.js
│   ├── components/
│   │ ├── RouteSystem.js
│   │ └── VirusSystem.js
│   ├── controllers/
│   │ └── SimulationController.js
│   ├── market-data/
│   │ └── real/
│   │   ├── BitqueryService.js
│   │   ├── MarketDataStream.js
│   │   └── MarketToVirusTranslator.js
│   └── dev-server.js
└── frontend/
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── components/
        │ ├── LiveStream.tsx
        │ ├── MapViewer.tsx
        │ └── Layout/
        ├── pages/
        └── context/


## Performance Considerations

### Backend
- WebSocket server optimized for multiple clients
- Efficient state management
- Binary data transmission
- Market data caching and rolling windows
- Optimized data translation
- Geospatial calculations optimization
- Population impact caching

### Frontend
- WebGL-based rendering with DeckGL
- Optimized layer updates
- Memoized computations
- Population density visualization
- Regional boundary rendering

## Future Extensions
1. Advanced Market Data Integration
   - Multiple token support
   - Cross-chain analytics
   - Custom market indicators
2. Enhanced Virus Behavior
   - Market-driven mutations
   - Complex spread patterns
   - Adaptive growth rates
3. Analytics and Visualization
   - Market-virus correlation analysis
   - Predictive modeling
   - Real-time metrics dashboard
4. Population Impact Analysis
   - Detailed regional spread tracking
   - Urban/rural spread differentials
   - Population density heat maps
   - Real-time infection statistics

## Deployment
- Backend prepared for cloud deployment
- Frontend optimized for static hosting
- Environment configuration ready
- Regional data management system
- Population tracking infrastructure