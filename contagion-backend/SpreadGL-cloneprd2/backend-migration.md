# Backend Migration Guide for SpreadGL Project

### 1. Project Entry Point and Server Setup
- Primary entry point: `src/dev-server.js`
- Startup command: `node src/dev-server.js`
- Server initialization:
  ```javascript
  const PORT = process.env.PORT || 8080;
  const app = express();
  const server = http.createServer(app);
  const simulationServer = new SimulationServer(server);
  ```

### 2. Core Dependencies
```json
{
  "dependencies": {
    // Server Core
    "express": "^4.18.2",
    "ws": "^8.16.0",
    "cors": "^2.8.5",
    "body-parser": "^1.19.0",
    
    // Data Layer
    "@deck.gl/core": "^8.9.36",
    "@deck.gl/layers": "^8.9.36",
    "@deck.gl/aggregation-layers": "^8.9.0",
    
    // Map Rendering
    "maplibre-gl": "^3.6.2",
    
    // Utilities
    "path-browserify": "^1.0.1",
    "d3-array": "^3.0.0",
    "d3-scale": "^4.0.0"
  },
  "devDependencies": {
    "dotenv": "^16.4.7",
    "nodemon": "^2.0.22",
    "webpack-node-externals": "^3.0.0"
  }
}
```

### 3. Essential Server Files

#### 3.1 src/dev-server.js
- Main Express server setup
- API endpoints:
  - POST `/api/simulation/control`: Handles simulation control actions
  - GET `/api/simulation/state`: Returns current simulation state
  - GET `/health`: Health check endpoint
- Development panel UI serving
- WebSocket initialization
- Error handling middleware

File Structure:
```
dev-server.js
├── Express setup
├── WebSocket initialization
├── API Routes
│   ├── /api/simulation/control
│   └── /dev-panel
└── Static file serving
```

#### 3.2 src/server/SimulationServer.js
- WebSocket server implementation
- Route system management
- Virus system integration
- Real-time state broadcasting
- Key methods:
  ```javascript
  initialize()
  handleConnection(ws)
  broadcast(data)
  handleControl(type, data)
  ```

File Structure:
```
SimulationServer.js
├── Class: RouteSystem
│   ├── Vehicle management
│   ├── Route tracking
│   └── Position calculations
├── Class: VirusSystem
│   ├── Point generation
│   ├── Growth patterns
│   └── State management
└── WebSocket handling
```

### 2. Development Server (`src/`)
```
dev-server.js
├── Express setup
├── WebSocket initialization
├── API Routes
│   ├── /api/simulation/control
│   └── /dev-panel
└── Static file serving
```

File Structure:
```
VirusSystem.js
├── Growth Patterns
│   ├── NORMAL
│   ├── VECTOR
│   └── BURST
├── Point Management
│   ├── Generation
│   ├── Updates
│   └── State tracking
└── WebSocket integration
```

### 4. Required Environment Variables
```env
PORT=8080
NODE_ENV=development
WS_HEARTBEAT_INTERVAL=30000
MAX_CONNECTIONS=100
DEBUG_MODE=true
```

### 5. Data Structures

#### 5.1 Route System Data
```javascript
{
  vehicles: [
    {
      id: string,
      type: 'plane' | 'ship',
      position: [number, number],
      progress: number,
      pathIndex: number
    }
  ],
  routes: [
    {
      start: [number, number],
      end: [number, number],
      type: string,
      id: string
    }
  ]
}
```

#### 5.2 Virus System Data
```javascript
{
  points: Map<string, {
    position: [number, number],
    intensity: number,
    age: number,
    pattern: 'NORMAL' | 'VECTOR' | 'BURST'
  }>,
  activeSpores: Map<string, {
    id: string,
    pattern: string,
    created: number,
    points: number[]
  }>
}
```

### 6. API Endpoints Documentation

#### 6.1 Control Endpoint (POST /api/simulation/control)
Actions:
- `start`: Start simulation
- `stop`: Stop simulation
- `reset`: Reset simulation state
- `add_route`: Add new route
- `virus_boost`: Increase virus spread
- `virus_suppress`: Decrease virus spread
- `virus_spawn`: Spawn new virus point
- `virus_param_update`: Update virus parameters
- `virus_pattern`: Set growth pattern

Example request:
```json
{
  "action": "virus_spawn",
  "params": {
    "coordinates": [longitude, latitude],
    "pattern": "NORMAL"
  }
}
```

#### 6.2 State Endpoint (GET /api/simulation/state)
Returns:
```json
{
  "status": {
    "isRunning": boolean,
    "routeSystem": boolean,
    "virusSystem": boolean
  },
  "layers": {
    "route": {
      "paths": { "data": [] },
      "endpoints": { "data": [] },
      "vehicles": { "data": [] }
    },
    "virus": {
      "points": { "data": [] }
    }
  }
}
```

### 7. WebSocket Communication
- Connection: `ws://localhost:8080`
- Message Types:
  - `request_state`: Request current simulation state
  - `control`: Send control commands
  - State updates: Broadcasted every frame

### 8. Migration Steps

1. Initial Setup:
   ```bash
   mkdir spreadgl-backend
   cd spreadgl-backend
   npm init
   npm install
   ```

2. File Migration:
   ```bash
   cp src/dev-server.js new-project/src/
   cp src/server/SimulationServer.js new-project/src/server/
   cp src/components/VirusSystem.js new-project/src/components/
   ```

3. Environment Configuration:
   - Create .env file
   - Set up environment variables
   - Configure development/production settings
   - Update connection URLs

4. Data Layer Setup:
   - Verify route system initialization
   - Test virus system setup
   - Confirm state management
   - Validate data structures

5. Integration Testing:
   ```bash
   # Start server (primary method)
   node src/dev-server.js
   
   # Alternative using npm script
   npm start
   
   # Development with auto-reload
   npm run dev
   
   # Test WebSocket
   wscat -c ws://localhost:8080
   
   # Verify endpoints
   curl http://localhost:8080/api/simulation/control
   ```

### 9. Potential Breaking Points
- Module System
  - ES Modules vs CommonJS
  - Import/Export syntax
  - Path resolutions
- WebSocket Implementation
  - Connection handling
  - Message formatting
  - Client reconnection
  - State synchronization
- State Management
  - Data structure consistency
  - Update cycles
  - Memory management
  - Garbage collection
- API Compatibility
  - Request validation
  - Response formats
  - Error handling
  - Status codes

### 10. Health Verification Checklist

Server Health:
- [ ] Server starts without errors
- [ ] Memory usage is stable
- [ ] CPU usage is normal
- [ ] No memory leaks
- [ ] Garbage collection working

WebSocket:
- [ ] Connections establish
- [ ] Messages send/receive
- [ ] State updates properly
- [ ] Reconnection works
- [ ] Multiple clients handle correctly

Virus System:
- [ ] All patterns work
- [ ] Point generation correct
- [ ] State updates properly
- [ ] Memory cleanup works
- [ ] Performance is stable

Route System:
- [ ] Routes initialize
- [ ] Vehicles update
- [ ] Positions calculate
- [ ] State syncs properly

### 11. Performance Considerations
- WebSocket message frequency
- Virus point generation limits
- Route update optimization
- State broadcast throttling
- Memory cleanup for inactive connections

### 12. Debugging Tools
- Health endpoint: `GET /health`
- Console logging for all major operations
- State endpoint for manual verification
- WebSocket message monitoring

### Notes
- Backup all files before migration
- Test in isolation before integration
- Monitor memory usage
- Log all errors during migration
- Document any changes made
- Keep original code for reference
- Test with production data volume 