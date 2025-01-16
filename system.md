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
│ ├── server/
│ │ └── SimulationServer.js
│ ├── components/
│ │ ├── RouteSystem.js
│ │ └── VirusSystem.js
│ ├── controllers/
│ │ └── SimulationController.js
│ └── dev-server.js
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

### Frontend
- WebGL-based rendering with DeckGL
- Optimized layer updates
- Memoized computations

## Future Extensions
1. Cryptocurrency Market Integration
2. Advanced Visualization Features
3. Enhanced Analytics
4. Scaling Capabilities

## Deployment
- Backend prepared for cloud deployment
- Frontend optimized for static hosting
- Environment configuration ready