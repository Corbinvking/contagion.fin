# Contagion System Architecture

## Overview
Contagion is a real-time virus simulation system that combines cryptocurrency market data with an interactive visualization platform. The system consists of a Node.js backend for simulation logic and a React frontend for visualization.

## Core Components

### Backend Architecture

#### 1. Simulation Server (`src/server/SimulationServer.js`)
Primary WebSocket server that handles:
- Client connections
- Real-time state broadcasting
- Message handling
- Virus spawn control
- Route management

Key methods:

handleConnection(ws) {
    console.log('Client connected');
    this.clients.add(ws);
    
    // Send initial state
    ws.send(JSON.stringify({
      type: 'initial_state',
      data: this.simulation.getState()
    }));
    
    ws.on('message', (message) => this.handleMessage(ws, message));
    ws.on('close', () => {
      console.log('Client disconnected');
      this.clients.delete(ws);
    });
  }


#### 2. Route System (`src/components/RouteSystem.js`)
Manages transportation routes and vehicles:
- Predefined air and sea routes
- Vehicle movement simulation
- Route visualization data

Key features:

import { IconLayer, PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';

class RouteSystem {
    constructor() {
        this.vehicles = [];
        this.routes = [];
        this.vehicleLayer = null;
        this.pathLayer = null;
        this.endpointLayer = null;
        this.labelLayer = null;
        this.iconAtlas = null;
        this.lastUpdate = Date.now();
        this.setupIconAtlas();
    }


#### 3. Virus System (`src/components/VirusSystem.js`)
Controls virus behavior and spread:
- Multiple growth patterns (NORMAL, VECTOR, BURST)
- Intensity and color management
- Spread mechanics

Core patterns:

 },
    DORMANT: {
        name: 'DORMANT',
        duration: 750,
        multiplier: 1.0,
        sporeActivation: true
    }
};

// Add growth patterns alongside existing states
const GROWTH_PATTERNS = {
    NORMAL: {
        name: 'NORMAL',
        tickRate: 2000,
        spreadDistance: 0.5,
        spawnProbability: 0.7,
        color: [255, 0, 0]
    },
    VECTOR: {
        name: 'VECTOR',
        tickRate: 1500,
        spreadDistance: 1.5,
        spawnProbability: 0.5,
        color: [255, 165, 0]
    },
    BURST: {
        name: 'BURST',
        tickRate: 1000,
        spreadDistance: 2.5,
        spawnProbability: 0.9,
        color: [139, 0, 0]
    }
};

#### 4. Simulation Controller (`src/controllers/SimulationController.js`)
Orchestrates the entire simulation:
- System initialization
- State management
- Update loop
- Subscriber notifications

Key initialization:

async initialize() {
        try {
            console.log('Initializing simulation controller...');
            
            // Initialize route system
            this.routeSystem = new RouteSystem();
            await this.routeSystem.initialize();
            console.log('Route system initialized');

            // Initialize virus system
            this.virusSystem = new VirusSystem();
            this.virusSystem.initialize([-74.006, 40.7128]);
            console.log('Virus system initialized');

            return true;
        } catch (error) {
            console.error('Simulation initialization error:', error);
            return false;
        }
    }

    start() {
        if (!this.isRunning) {

#### 5. Development Server (`src/dev-server.js`)
Express server providing:
- HTTP endpoints for control
- Static file serving
- Health checks
- CORS handling

Key routes:

app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Enhanced logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from dist directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Root route and dev-panel route - serve enhanced dev-panel.html
app.get(['/', '/dev-panel', '/dev-panel.html'], (req, res) => {
    const html = `
        
## Development Setup

### Backend

cd contagion-backend
npm install
npm run dev

Starts server on `localhost:8080`

### Environment Configuration
Required environment variables: 
env
PORT=8080
NODE_ENV=development


#  Frontend Architecture

## Overview
The frontend is a React application built with TypeScript, Vite, and DeckGL for real-time visualization of virus spread patterns and transportation routes.

## Core Components

### 1. Application Entry
#### Main Entry (`src/main.tsx`)

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

- Uses React 18's `createRoot`
- Wraps app in StrictMode
- Mounts to root element

#### App Component (`src/App.tsx`)
Primary router and context provider setup:

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


Key features:
- React Router configuration
- Context providers:
  - AuthProvider: Authentication state
  - MutationProvider: State mutations
- Layout wrapper
- Route definitions:
  - `/`: Main simulation stream
  - `/metrics`: Dashboard
  - `/virus-insights`: Analysis
  - `/docs`: Documentation

### 2. Real-Time Visualization

#### LiveStream Component (`src/components/LiveStream.tsx`)
Handles backend connectivity and stream status:

Connection Management:

const LiveStream = () => {
  const [status, setStatus] = useState({
    isLoading: true,
    error: null as string | null,
    isConnected: false
  });

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_HTTP_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setStatus({
          isLoading: false,
          error: null,
          isConnected: data.status === 'ok'
        });
      } else {
        throw new Error('Simulation server not responding');
      }
    } catch (err) {
      setStatus({
        isLoading: false,
        error: 'Unable to connect to simulation server',
        isConnected: false
      });
    }
  }, []);


Key features:
- Backend health checks
- Connection status management
- Error handling
- Auto-reconnection
- Loading states

#### MapViewer Component (`src/components/MapViewer.tsx`)
Core visualization engine using DeckGL:

Type Definitions:

interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    maxZoom: number;
    minZoom: number;
}

interface RouteData {
    start: [number, number];
    end: [number, number];
}

interface EndpointData {
    position: [number, number];
    isStart: boolean;
    label: string;
}

interface VehicleData {
    type: 'plane' | 'ship';
    position: [number, number];
    angle: number;
}

interface VirusPoint {
    position: [number, number];
    colorIntensity: number;
    radius: number;
}

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
    performance?: any;
}


Layer Management:

connectWebSocket();

        return () => {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (ws.current) ws.current.close();
        };
    }, []);

    // Layer counts for debug overlay
    const layerCounts = React.useMemo(() => ({
        routes: (
            (simulationState?.layers?.route?.paths?.data?.length || 0) +
            (simulationState?.layers?.route?.endpoints?.data?.length || 0) +
            (simulationState?.layers?.route?.vehicles?.data?.length || 0)
        ),
        virus: simulationState?.layers?.virus?.points?.data?.length || 0
    }), [simulationState]);

    // Combine all layers
    const layers = React.useMemo(() => {
        if (!simulationState?.layers || !iconAtlasRef.current) return [];

        const allLayers = [];
        
        // Add route layers
        if (simulationState.layers.route) {
            // Paths with dashed lines
            if (simulationState.layers.route.paths?.data) {
                allLayers.push(
                    new PathLayer<RouteData>({
                        id: 'route-paths',
                        data: simulationState.layers.route.paths.data,
                        getPath: (d: RouteData) => [d.start, d.end],
                        getColor: PATH_COLOR,
                        getWidth: 1,
                        widthMinPixels: 1,
                        opacity: 0.8,
                        getDashArray: [1, 8],
                        parameters: {
                            depthWrite: false,
                            blend: true,
                            blendFunc: [770, 771]
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPath: simulationState.timestamp
                        }
                    })
                );
            }

            // Endpoints with labels
            if (simulationState.layers.route.endpoints?.data) {
                allLayers.push(
                    new ScatterplotLayer<EndpointData>({
                        id: 'route-endpoints',
                        data: simulationState.layers.route.endpoints.data,
                        getPosition: (d: EndpointData) => d.position,
                        getFillColor: (d: EndpointData) => d.isStart ? ENDPOINT_COLORS.START : ENDPOINT_COLORS.END,
                        getRadius: 6,
                        radiusMinPixels: 4,
                        parameters: {
                            depthWrite: false,
                            blend: true
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPosition: simulationState.timestamp
                        }
                    })
                );

                allLayers.push(
                    new TextLayer<EndpointData>({
                        id: 'endpoint-labels',
                        data: simulationState.layers.route.endpoints.data,
                        getPosition: (d: EndpointData) => d.position,
                        getText: (d: EndpointData) => d.label,
                        getSize: 14,
                        getColor: [25, 25, 25],
                        getAngle: 0,
                        getTextAnchor: 'middle',
                        getAlignmentBaseline: 'center',
                        getPixelOffset: [0, -20],
                        parameters: {
                            depthWrite: false,
                            blend: true
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPosition: simulationState.timestamp
                        }
                    })
                );
            }

            // Vehicles with proper icons
            if (simulationState.layers.route.vehicles?.data) {
                allLayers.push(
                    new IconLayer<VehicleData>({
                        id: 'vehicle-layer',
                        data: simulationState.layers.route.vehicles.data,
                        iconAtlas: iconAtlasRef.current,
                        iconMapping: {
                            plane: { x: 0, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 },
                            ship: { x: 32, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 }
                        },
                        getIcon: (d: VehicleData) => d.type,
                        getPosition: (d: VehicleData) => d.position,
                        getSize: (d: VehicleData) => d.type === 'plane' ? 20 : 16,
                        getAngle: (d: VehicleData) => d.angle + 90,
                        sizeScale: 1,
                        sizeUnits: 'pixels',
                        sizeMinPixels: 10,
                        sizeMaxPixels: 20,
                        parameters: {
                            depthWrite: false,
                            blend: true
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPosition: simulationState.timestamp,
                            getAngle: simulationState.timestamp
                        }
                    })
                );
            }
        }

        // Virus layer
        if (simulationState.layers.virus?.points?.data) {
            allLayers.push(
                new ScatterplotLayer<VirusPoint>({
                    id: 'virus-points',
                    data: simulationState.layers.virus.points.data,
                    getPosition: (d: VirusPoint) => d.position,
                    getFillColor: (d: VirusPoint) => [
                        200,
                        0,
                        0,
                        Math.floor(255 * d.colorIntensity)
                    ],
                    getRadius: (d: VirusPoint) => d.radius,
                    radiusMinPixels: 3,
                    radiusMaxPixels: 15,
                    parameters: {
                        depthWrite: false,
                        blend: true,
                        blendFunc: [770, 771]
                    },
                    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                    
                
Features:
- Multiple layer types:
  - ScatterplotLayer: Virus points
  - PathLayer: Transportation routes
  - IconLayer: Vehicles
  - TextLayer: Location labels
- Real-time updates via WebSocket
- Custom icon atlas for vehicles
- Performance optimizations

## State Management

### 1. Connection State

nterface ConnectionState {
isLoading: boolean;
error: string | null;
isConnected: boolean;
}


### 2. Simulation State

nterface SimulationState {
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
performance?: any;
}


## Real-Time Communication

### WebSocket Integration

onst BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL;


Features:
- Automatic reconnection
- Binary state updates
- Error handling
- Performance monitoring

### HTTP Integration

const BACKEND_HTTP_URL = import.meta.env.VITE_BACKEND_HTTP_URL;


Endpoints:
- `/health`: Connection status
- `/api/simulation/control`: Control commands
- `/api/simulation/state`: State queries

## Visualization Layers

### 1. Route System
- Path visualization
- Vehicle movement
- Endpoint markers
- Location labels

### 2. Virus System
- Spread visualization
- Intensity mapping
- Color gradients
- Radius scaling

## Development Setup

### Environment Configuration
Required variables:

env
VITE_BACKEND_WS_URL=ws://localhost:8080
VITE_BACKEND_HTTP_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key


### Local Development

cd contagion-frontend
npm install
npm run dev


## File Structure

contagion-frontend/
├── src/
│ ├── main.tsx # Application entry
│ ├── App.tsx # Router and providers
│ ├── components/
│ │ ├── LiveStream.tsx # Connection management
│ │ ├── MapViewer.tsx # Visualization engine
│ │ └── Layout/ # UI components
│ ├── pages/
│ │ ├── Stream.tsx
│ │ ├── Dashboard.tsx
│ │ └── Documentation.tsx
│ └── context/
│ ├── AuthContext.tsx
│ └── MutationContext.tsx


## Performance Considerations

### 1. Rendering Optimization
- WebGL-based rendering with DeckGL
- Layer update triggers
- Memoized computations
- Binary WebSocket data

### 2. State Updates
- Timestamp-based updates
- Layer-specific triggers
- Batched state updates

### 3. Asset Management
- Custom icon atlas
- Preloaded map styles
- Optimized layer parameters

## Future Considerations

### 1. Scaling
- WebSocket connection pooling
- Layer optimization for large datasets
- State management optimization

### 2. Features
- Additional visualization layers
- Enhanced interactivity
- Market data integration
- Advanced analytics views



## Communication Flow

### 1. WebSocket Communication

A[Frontend Client] -->|WebSocket| B[SimulationServer]
B -->|State Updates| A
B -->|Control Messages| C[SimulationController]
C -->|Updates| D[VirusSystem]
C -->|Updates| E[RouteSystem]


### 2. HTTP Endpoints
- `/health`: System status check
- `/api/simulation/control`: Simulation control endpoints
- `/api/simulation/state`: Current state retrieval

## State Management

### Simulation State


{
timestamp: number,
layers: {
route: RouteLayerData[],
virus: VirusLayerData[]
},
status: {
isRunning: boolean,
routeSystem: boolean,
virusSystem: boolean
}
}


### Growth Patterns
Three distinct virus growth patterns:
1. NORMAL: Standard radial spread
2. VECTOR: Directional movement
3. BURST: Explosive spread



## Integration Points

### 1. Frontend Integration
- WebSocket connection on `ws://localhost:8080`
- HTTP endpoints on `http://localhost:8080`
- Real-time state updates via WebSocket
- Control commands via HTTP POST

### 2. Cryptocurrency Integration
Prepared endpoints for:
- Market data ingestion
- Dynamic parameter updates
- State modifications based on market events

## Future Considerations

### 1. Scaling
- WebSocket server designed for multiple clients
- Modular system architecture
- Separated concerns for easy scaling

### 2. Deployment
- Backend ready for cloud deployment
- Environment configuration prepared
- Stateless design for horizontal scaling

### 3. Extensions
- Cryptocurrency market data integration
- Additional growth patterns
- Enhanced route systems
- Advanced visualization options

## File Structure

contagion-backend/
├── src/
│ ├── server/
│ │ └── SimulationServer.js
│ ├── components/
│ │ ├── RouteSystem.js
│ │ └── VirusSystem.js
│ ├── controllers/
│ │ └── SimulationController.js
│ └── dev-server.js

