# Virus Simulation Layer Control PRD

## Overview
This document outlines improvements to the virus simulation layer control system, focusing on independent manipulation of the virus animation layer while maintaining the integrity of other visualization components.

## Current Architecture
Reference: Version1MapView.js
- Map Layer (Base CartoDB dark theme)
- Route System (Independent path management)
- Virus System (Infection spread visualization)
- Combined animation loop

## Proposed Improvements

### 1. Separate Animation Loop Management
#### Current State
typescript:SpreadGL-cloneprd2/src/components/
Version1MapView.js

startLine: 32
endLine: 46

Currently, all animations update in a single loop.


#### Proposed Changes
- Create independent animation loops for each system
- Implement separate requestAnimationFrame handlers
- Add pause/resume controls for virus animation
- Maintain route system updates regardless of virus state

### 2. Direct Virus Layer Control Interface
#### Current State
The virus system is initialized with fixed parameters and lacks direct control mechanisms.

#### Proposed Implementation
typescript
interface VirusLayerControls {
speed: number; // Animation speed multiplier
spread: number; // Infection spread radius
intensity: number; // Visual intensity of infection
visibility: boolean; // Layer visibility toggle
colorGradient: string[]; // Infection visualization colors
particleCount: number; // Number of infection particles
}

### 3. State Management System
#### Integration Points
- Connect with existing mutation system:
typescript:contagion.demosite.1/src/components/VirusInsights/TabViews/TransmissionView.tsx
startLine: 6
endLine: 91

#### Features
- Real-time mutation effects on visualization
- Persistent state across component updates
- Event-driven state changes
- Performance optimization for state updates

### 4. Event System Implementation
#### Core Events
- onInfectionSpread
- onMutationEffect
- onTransmissionChange
- onVirusPropertyUpdate

#### Integration with Existing Components
typescript:contagion.demosite.1/src/components/VirusInsights/TabViews/DiseaseView.tsx
startLine: 40
endLine: 52

## Technical Requirements

### Performance Considerations
- Maintain 60 FPS during animation
- Efficient layer rendering
- Minimal memory footprint
- Optimized state updates

### API Design
typescript
interface VirusLayerAPI {
// Layer Control
setVisibility(visible: boolean): void;
setIntensity(level: number): void;
// Animation Control
pause(): void;
resume(): void;
setSpeed(multiplier: number): void;
// State Management
updateProperties(props: Partial<VirusLayerControls>): void;
// Event Handlers
addEventListener(event: VirusEventType, callback: Function): void;
removeEventListener(event: VirusEventType, callback: Function): void;
}

### Integration Requirements
- Maintain compatibility with existing DeckGL layers
- Support for real-time mutation effects
- Seamless integration with current UI components
- Cross-browser compatibility

## Implementation Phases

### Phase 1: Layer Separation
- Separate animation loops
- Implement basic controls
- Add visibility toggles

### Phase 2: Control Interface
- Develop control API
- Implement state management
- Add event system

### Phase 3: UI Integration
- Create control panel
- Add visual feedback
- Implement mutation effects

### Phase 4: Optimization
- Performance tuning
- Memory optimization
- Animation smoothing

## Success Metrics
- Smooth animation at 60 FPS
- < 16ms per frame
- Zero interference with other layers
- Responsive controls
- Memory usage < 100MB