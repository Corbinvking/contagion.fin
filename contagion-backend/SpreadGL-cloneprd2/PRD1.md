# MapViewer Enhancement Implementation Plan

## Overview
This document outlines the phase-by-phase implementation plan for enhancing the MapViewer component to achieve feature parity with the reference implementation while maintaining the current client-server architecture.


## Phase 1: Map Interaction fix

### File Changes

// src/components/MapViewer.tsx
const MapViewer: React.FC = () => {
// Add enhanced controller options
// Implement proper cursor handling
// Add interaction state management
}


### Implementation Steps
1. Update DeckGL controller settings
   - make sure we can click and drag he map to navigate around
   - animations should remain visible ontop of map and keep there position on the map


2. Implement interaction handlers
   - Pan events
   - Zoom events
   - Click events
   - Hover states

3. Add viewport state management
   - Track view state changes
   - Handle transitions
   - Maintain layer visibility

### Testing Criteria
- Smooth pan/zoom operations
- Proper cursor feedback
- Layer visibility during interactions
- Performance meets 60 FPS target

## Phase 2: Animation System Enhancement

### File Changes

// src/server/SimulationServer.js
class SimulationController 
{
// Add animation state management
// Implement transition system
// Add timing controls
}

// src/components/MapViewer.tsx
const AnimationSystem = 
{
// Add animation loop management
// Implement transition handling
// Add performance optimizations
}
 reffrnece @outbreakvirus.js @spore-system.js @routesystem.js @growth-state-managment
### Implementation Steps
1. Server-side animation management
   - Add animation state tracking
   - Implement timing system
   - Add transition calculations

2. Client-side animation rendering
   - Implement smooth transitions
   - Add animation interpolation
   - Optimize update cycle

3. WebSocket synchronization
   - Add animation state sync
   - Implement timing sync
   - Add transition messaging

### Testing Criteria
- Smooth animations at 60 FPS
- Proper transition handling
- Synchronized state across clients
- Efficient WebSocket usage

## Phase 3: Layer System Enhancement

### File Changes

typescript
// src/components/MapViewer.tsx
const LayerSystem = {
// Implement enhanced layer management
// Add blending modes
// Configure depth testing
}


### Implementation Steps
1. Layer management enhancement
   - Add all reference layer types
   - Implement proper ordering


3. Performance optimization
   - Add layer culling
   - Implement lazy updates
   - Optimize render pipeline

### Testing Criteria
- Visual quality matches reference
- Proper layer ordering
- Efficient layer updates
- Smooth blending and transitions

## Phase 4: Dev Panel Enhancement

### File Changes

typescript
// public/dev-panel.html
// Add enhanced UI components
// Implement control interfaces
// Add monitoring tools
// src/dev-server.js
// Add control endpoints
// Implement monitoring
// Add state inspection


### Implementation Steps
1. UI Enhancement
   - Add layer controls
   - Implement animation controls
   - Add monitoring displays

2. Server Integration
   - Add control endpoints
   - Implement monitoring
   - Add state inspection

3. WebSocket Enhancement
   - Add control messaging
   - Implement state sync
   - Add error handling

### Testing Criteria
- fluid animation editing freedom ( add animations, remove them)
- should see a detailed list of all animations and virus spawn points
- All controls functional
- Real-time monitoring working
- Proper error handling
- Responsive interface

