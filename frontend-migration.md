## Frontend Migration Guide for SpreadGL Project

### 1. Core Frontend-Backend Integration Components

#### 1.1 src/components/MapViewer.tsx
- Primary visualization component
- WebSocket connection management
- Real-time state updates
- Key features:
  ```typescript
  // WebSocket connection
  ws.current = new WebSocket('ws://localhost:8080')
  
  // Message handling
  onmessage = (event) => {
    // Handles 'simulation_update' and 'initial_state'
    setSimulationState(message.data)
  }
  
  // Layer management
  const layers = {
    routes: simulationState?.layers?.route,
    virus: simulationState?.layers?.virus
  }
  ```

#### 1.2 src/components/LiveStream.tsx
- Connection status management
- Health check polling
- MapViewer container
- Key endpoints:
  ```typescript
  // Health check
  fetch('http://localhost:8080/health')
  ```

### 2. API Integration Points

#### 2.1 Simulation Control API
- Endpoint: `POST /api/simulation/control`
- Actions:
  - `start`: Start simulation
  - `stop`: Stop simulation
  - `reset`: Reset simulation state
  - `virus_spawn`: Spawn new virus point
  - `virus_pattern`: Set growth pattern
  - `virus_boost`: Increase spread
  - `virus_suppress`: Decrease spread

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

#### 2.2 State Management API
- Endpoint: `GET /api/simulation/state`
- Returns current simulation state
- Structure:
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

### 3. WebSocket Communication

#### 3.1 Connection
- URL: `ws://localhost:8080`
- Auto-reconnection enabled
- Connection status monitoring

#### 3.2 Message Types
- `simulation_update`: Regular state updates
- `initial_state`: Initial state on connection
- Structure matches state API response

### 4. Development Tools

#### 4.1 Dev Panel (public/dev-panel.html)
- Real-time state monitoring
- Simulation controls
- WebSocket connection status
- Layer statistics

#### 4.2 Debug Features
- Connection status indicators
- Performance monitoring
- Layer counts display
- Error handling and logging

### 5. Integration Points Checklist

- [ ] WebSocket connection management
- [ ] State synchronization
- [ ] Control message handling
- [ ] Layer data processing
- [ ] Error handling
- [ ] Reconnection logic
- [ ] Performance monitoring

### 6. Performance Considerations

1. WebSocket Efficiency:
   - Message batching
   - Binary message format
   - Reconnection backoff

2. State Management:
   - Memoization of layer calculations
   - Efficient update diffing
   - Render optimization

3. Error Handling:
   - Graceful degradation
   - User feedback
   - Automatic recovery

### 7. Security Notes

1. API Security:
   - CORS configuration
   - Rate limiting
   - Input validation

2. WebSocket Security:
   - Connection validation
   - Message authentication
   - Error handling

### 8. Testing Strategy

1. Connection Testing:
   - WebSocket connection stability
   - Reconnection behavior
   - Message handling

2. State Management:
   - Data consistency
   - Update propagation
   - Error recovery

3. Performance Testing:
   - Message throughput
   - Render performance
   - Memory usage

### 9. Essential Files for UI Migration

#### 9.1 Core Connection Files
These files must be migrated/adapted regardless of UI framework:

1. **WebSocket Connection Management**:
   - `src/components/MapViewer.tsx` → Core WebSocket setup and state management
   - `src/components/LiveStream.tsx` → Health check and connection status

2. **State Types and Interfaces**:
   ```typescript
   interface SimulationState {
     status: {
       isRunning: boolean;
       routeSystem: boolean;
       virusSystem: boolean;
     };
     layers: {
       route: RouteLayer;
       virus: VirusLayer;
     };
   }
   ```

#### 9.2 Minimum Required Implementations
Any new UI must implement these core functionalities:

1. **Connection Management**:
   ```typescript
   // WebSocket connection
   const ws = new WebSocket('ws://localhost:8080');
   
   // Health check polling
   fetch('http://localhost:8080/health');
   
   // State management
   ws.onmessage = (event) => {
     const message = JSON.parse(event.data);
     if (message.type === 'simulation_update') {
       // Update application state
     }
   };
   ```

2. **Control Interface**:
   ```typescript
   // Control actions
   async function controlSimulation(action: string, params?: any) {
     await fetch('/api/simulation/control', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ action, params })
     });
   }
   ```

### 10. Detailed File Reference Guide

#### 10.1 Core Files and Their Purposes

1. **Frontend Entry Points**:
   - `src/components/MapViewer.tsx`
     - Main visualization component
     - Handles WebSocket connection
     - Manages simulation state
     - Dependencies: deck.gl for visualization
     ```typescript
     // Key imports needed
     import { DeckGL } from '@deck.gl/react';
     import { ScatterplotLayer } from '@deck.gl/layers';
     ```

   - `src/components/LiveStream.tsx`
     - Connection status management
     - Health check implementation
     - Error handling and retry logic
     - Parent component for MapViewer

2. **Development Tools**:
   - `public/dev-panel.html`
     - Standalone development interface
     - Direct WebSocket testing
     - State visualization
     ```html
     <!-- Key elements to maintain -->
     <div id="connection-status"></div>
     <div id="state-display"></div>
     ```

   - `src/components/VirusSystem.js`
     - Virus simulation logic
     - Growth patterns implementation
     - Point management
     ```javascript
     // Essential methods to implement
     addPoint(x, y)
     setGrowthPattern(pattern)
     update(deltaTime)
     ```

#### 10.2 Key Dependencies and Configuration

1. **Package Dependencies**:
   ```json
   {
     "dependencies": {
       "@deck.gl/core": "^8.x",
       "@deck.gl/layers": "^8.x",
       "@deck.gl/react": "^8.x",
       "react": "^17.x",
       "react-dom": "^17.x",
       "react-map-gl": "^6.x"
     }
   }
   ```

2. **Environment Configuration**:
   ```typescript
   // Required environment variables
   const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
   ```

#### 10.3 Implementation Notes

1. **WebSocket Connection Flow**:
   ```typescript
   // src/components/MapViewer.tsx
   useEffect(() => {
     const connectWebSocket = () => {
       ws.current = new WebSocket(WS_URL);
       
       ws.current.onopen = () => {
         setConnected(true);
         setError(null);
       };
       
       ws.current.onclose = () => {
         setConnected(false);
         // Implement reconnection with backoff
         setTimeout(connectWebSocket, 2000);
       };
       
       ws.current.onmessage = (event) => {
         const message = JSON.parse(event.data);
         if (message.type === 'simulation_update') {
           setSimulationState(message.data);
         }
       };
     };
     
     connectWebSocket();
     return () => ws.current?.close();
   }, []);
   ```

2. **Layer Management**:
   ```typescript
   // src/components/MapViewer.tsx
   const layers = React.useMemo(() => {
     if (!simulationState?.layers) return [];
     
     return [
       // Virus points layer
       new ScatterplotLayer({
         id: 'virus-points',
         data: simulationState.layers.virus.points.data,
         getPosition: d => d.position,
         getRadius: d => d.radius,
         getFillColor: d => [255, 0, 0, d.intensity * 255]
       }),
       // Route layers
       ...createRouteLayers(simulationState.layers.route)
     ];
   }, [simulationState]);
   ```

#### 10.4 Common Gotchas and Solutions

1. **WebSocket Reconnection**:
   - Issue: Lost connections during development
   - Solution: Implement exponential backoff
   ```typescript
   let retryCount = 0;
   const maxRetries = 5;
   const getBackoffTime = () => Math.min(1000 * Math.pow(2, retryCount), 30000);
   ```

2. **State Updates**:
   - Issue: Frequent state updates causing performance issues
   - Solution: Implement throttling
   ```typescript
   const throttledSetState = useCallback(
     throttle((state) => setSimulationState(state), 16),
     []
   );
   ```

3. **Layer Updates**:
   - Issue: Unnecessary layer recalculations
   - Solution: Proper memoization
   ```typescript
   const layerCounts = React.useMemo(() => ({
     routes: simulationState?.layers?.route?.paths?.data?.length || 0,
     virus: simulationState?.layers?.virus?.points?.data?.length || 0
   }), [simulationState]);
   ```

#### 10.5 Development Workflow

1. **Initial Setup**:
   ```bash
   # Clone and setup
   git clone <repository>
   cd <project-directory>
   npm install
   
   # Start backend server
   cd backend
   npm start
   
   # Start frontend development
   cd frontend
   npm start
   ```

2. **Testing Flow**:
   - Start backend server first
   - Open dev-panel.html for connection testing
   - Monitor WebSocket messages in browser DevTools
   - Use Network tab to verify API calls

3. **Debug Tools**:
   ```typescript
   // Add to MapViewer.tsx
   const DEBUG = process.env.NODE_ENV === 'development';
   
   if (DEBUG) {
     console.log('Layer updates:', {
       virus: simulationState?.layers?.virus?.points?.data?.length,
       routes: simulationState?.layers?.route?.paths?.data?.length
     });
   }
   ```
