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
class SimulationServer {
constructor(httpServer) {
this.wss = new WebSocketServer({ server: httpServer });
this.clients = new Set();
this.simulation = new SimulationController();
}
// ... connection handling
}

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

##### Virus System (`src/components/VirusSystem.js`)
Controls virus behavior:
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

##### Market Data Integration (`src/market-data/real/`)
Real-time cryptocurrency market data integration:

###### BitqueryService (`BitqueryService.js`)
Handles GraphQL queries to Bitquery API:
```javascript
class BitqueryService {
    constructor() {
        this.endpoint = 'https://graphql.bitquery.io';
        this.cacheTimeout = 5000; // 5 seconds cache
    }
    async fetchTokenData(mintAddress) {
        // Fetches token transfers, price, and metrics
    }
}
```

###### Market Data Stream (`MarketDataStream.js`)
Manages continuous market data updates:
```javascript
class MarketDataStream extends EventEmitter {
    constructor(options = {}) {
        this.interval = options.interval || 60000; // Default 1 minute
        this.windowSize = options.windowSize || 5;  // Rolling window size
    }
    // Emits: 'data', 'error', 'stream:start', 'stream:stop'
}
```

###### Market To Virus Translator (`MarketToVirusTranslator.js`)
Converts market metrics to virus parameters:
```javascript
class MarketToVirusTranslator {
    translate(marketData, trends) {
        return {
            spreadRadius,      // Based on volume changes
            growthMultiplier, // Based on volatility
            intensity,        // Based on transaction count
            shouldSpawnNew    // Based on significant changes
        };
    }
}
```

Market Data Flow:
```
BitqueryService → MarketDataStream → MarketToVirusTranslator → VirusSystem
```

Market to Virus Mappings:
- Volume Changes → Spread Radius (10-200 units)
- Volatility → Growth Multiplier (0.5-3.0x)
- Transaction Count → Intensity (0.1-1.0)
- Significant Changes → New Spawn Points

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
A[Bitquery API] -->|GraphQL| B[BitqueryService]
B -->|Cached Data| C[MarketDataStream]
C -->|Events| D[MarketToVirusTranslator]
D -->|Virus Parameters| E[VirusSystem]
```

Key Events:
- BitqueryService: Token transfers and metrics (5s cache)
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

### Frontend
- WebGL-based rendering with DeckGL
- Optimized layer updates
- Memoized computations

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

## Deployment
- Backend prepared for cloud deployment
- Frontend optimized for static hosting
- Environment configuration ready