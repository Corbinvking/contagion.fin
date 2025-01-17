# GeoSpreadSystem Documentation

## Overview
The `GeoSpreadSystem` is a sophisticated virus transmission simulation system that models realistic city-to-city disease spread based on population density, geographical proximity, and urban characteristics. It extends the basic virus spread mechanics by implementing a more granular, population-aware transmission model.

## Core Components

### 1. State Management
```javascript
class GeoSpreadSystem {
    constructor() {
        this.infectedCities = new Map();        // Tracks infection levels
        this.transmissionRoutes = new Map();    // City connections
        this.activeHotspots = new Set();        // High-activity areas
        this.spreadMetrics = { ... };           // Real-time statistics
    }
}
```

### 2. Transmission Factors
The system uses weighted factors to calculate spread probability:
- **Population (0.4)**: Higher population centers have increased transmission rates
- **Distance (0.6)**: Geographic proximity influences spread likelihood
- **Connectivity (0.3)**: Well-connected cities spread faster
- **Urbanization (0.5)**: Urban areas have higher transmission rates

## Key Features

### 1. City-to-City Transmission
- Utilizes KD-tree spatial indexing for efficient nearest neighbor searches
- Implements bi-directional transmission routes between cities
- Considers population density and urban characteristics

### 2. Population-Aware Spread
```javascript
calculateTransmissionProbability(sourceCity, targetCity, pattern) {
    // Population factor (logarithmic scale)
    const popFactor = Math.log10(targetCity.population) / Math.log10(10000000);
    
    // Distance decay
    const distanceFactor = Math.exp(-distance / 1000);
    
    // Urban multiplier
    const urbanFactor = targetCity.isMetro ? 1.2 : 1.0;
}
```

### 3. Spread Patterns
Three distinct spread patterns with unique characteristics:
- **NORMAL**: Balanced spread (1.0x multiplier)
- **BURST**: Aggressive spread focusing on population centers (1.5x multiplier)
- **VECTOR**: Targeted spread along transportation routes (1.2x multiplier)

## Usage

### 1. Initialization
```javascript
const geoSpread = new GeoSpreadSystem();
const startPoint = [latitude, longitude];
const infectedCity = geoSpread.initializeSpread(startPoint, 'NORMAL');
```

### 2. Updating Simulation
```javascript
// Update simulation state (call in animation frame)
geoSpread.update(deltaTime);
```

### 3. Monitoring Spread
```javascript
const metrics = geoSpread.getSpreadMetrics();
console.log(`Total Infected: ${metrics.totalInfected}`);
console.log(`Active Hotspots: ${metrics.hotspotCount}`);
```

## Key Methods

### initializeSpread(startingPoint, pattern)
Starts a new infection at the nearest valid city to the given coordinates.
- **Parameters**:
  - `startingPoint`: [latitude, longitude]
  - `pattern`: 'NORMAL' | 'BURST' | 'VECTOR'
- **Returns**: City object or null if no valid city found

### updateTransmissionRoutes(sourceCity)
Updates the network of connected cities for transmission.
- **Parameters**:
  - `sourceCity`: City object
- **Effects**: Updates `transmissionRoutes` Map

### processTransmission(sourceCityName, infection, deltaTime)
Handles the spread of infection from a source city to connected cities.
- **Parameters**:
  - `sourceCityName`: String
  - `infection`: Infection data object
  - `deltaTime`: Number (milliseconds)

### calculateTransmissionProbability(sourceCity, targetCity, pattern)
Calculates the likelihood of transmission between cities.
- **Parameters**:
  - `sourceCity`: Source city object
  - `targetCity`: Target city object
  - `pattern`: Spread pattern string
- **Returns**: Probability (0-1)

## Integration with Existing Systems

### GeospatialSpawnController Integration
```javascript
constructor() {
    this.spawnController = new GeospatialSpawnController();
    // Inherits geographical data and KD-tree functionality
}
```

### Metrics and Monitoring
```javascript
updateSpreadMetrics() {
    // Updates real-time statistics
    this.spreadMetrics = {
        totalInfected,
        infectedByRegion,
        hotspotCount
    };
}
```

## Performance Considerations

### Space Complexity
- KD-tree: O(n) where n is number of cities
- Transmission routes: O(m) where m is number of infected cities
- City data cache: O(k) where k is number of active cities

### Time Complexity
- Initialization: O(log n) for finding start city
- Updates: O(m * k) where:
  - m = number of infected cities
  - k = average number of connections per city
- Metrics calculation: O(m)

## Example Workflow

```javascript
// Initialize system
const geoSpread = new GeoSpreadSystem();

// Start infection in New York
const startPoint = [40.7128, -74.0060];
geoSpread.initializeSpread(startPoint, 'NORMAL');

// Update loop
function simulate(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    geoSpread.update(deltaTime);
    
    // Get current metrics
    const metrics = geoSpread.getSpreadMetrics();
    
    // Update visualization
    updateVisualization(metrics);
    
    requestAnimationFrame(simulate);
}

requestAnimationFrame(simulate);
```

## Future Enhancements

1. **Transportation Networks**
   - Airport connections
   - Major highway routes
   - Maritime shipping lanes

2. **Environmental Factors**
   - Climate impact
   - Seasonal variations
   - Geographic barriers

3. **Intervention Modeling**
   - Quarantine measures
   - Travel restrictions
   - Vaccination campaigns

4. **Advanced Analytics**
   - Predictive modeling
   - Risk assessment
   - Spread pattern analysis
``` 