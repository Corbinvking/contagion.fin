import { ScatterplotLayer } from '@deck.gl/layers';
import GeospatialSpawnController from './GeospatialSpawnController';
import { 
    calculateInfectedPopulation, 
    getPopulationDensityAtPoint,
    getPopulationAffectedByPoint,
    getRegionStatistics
} from '../data/regions/index.js';

const GROWTH_STATES = {
    OUTBREAK: {
        name: 'OUTBREAK',
        duration: 2000,
        multiplier: 2.0,
        sporeActivation: true
    },
    SETTLEMENT: {
        name: 'SETTLEMENT',
        duration: 1500,
        multiplier: 0.7,
        sporeActivation: false
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

class VirusPoint {
    constructor(position, intensity = 1.0, colorIntensity = 1.0) {
        this.position = position;
        this.intensity = intensity;
        this.colorIntensity = colorIntensity;
        this.age = 0;
        this.active = true;
        this.baseIntensity = intensity;
        this.generation = 0;
        this.isEdge = true;
        this.radius = 10;
        this.direction = Math.random() * Math.PI * 2;
        this.lastSpreadTime = Date.now();
        this.spreadPattern = 'NORMAL';
    }

    calculateNextPosition(pattern = 'NORMAL', geoController = null) {
        const config = GROWTH_PATTERNS[pattern];
        const now = Date.now();
        
        if (now - this.lastSpreadTime < config.tickRate) {
            return null;
        }

        let newPosition;
        if (geoController) {
            // Use geospatial controller for position calculation
            newPosition = geoController.getNextSpawnPosition(this.position, pattern);
            if (!newPosition) {
                // Fallback to original logic if no valid point found
                return this._calculateFallbackPosition(pattern, config);
            }
        } else {
            // Use original position calculation logic
            newPosition = this._calculateFallbackPosition(pattern, config);
        }

        this.lastSpreadTime = now;
        return newPosition;
    }

    _calculateFallbackPosition(pattern, config) {
        switch (pattern) {
            case 'VECTOR':
                const newPos = [
                    this.position[0] + Math.cos(this.direction) * config.spreadDistance * 0.01,
                    this.position[1] + Math.sin(this.direction) * config.spreadDistance * 0.01
                ];
                this.direction += (Math.random() - 0.5) * 0.3;
                return newPos;

            case 'BURST':
                const burstAngle = Math.random() * Math.PI * 2;
                const burstDistance = (0.5 + Math.random() * 0.5) * config.spreadDistance;
                return [
                    this.position[0] + Math.cos(burstAngle) * burstDistance * 0.01,
                    this.position[1] + Math.sin(burstAngle) * burstDistance * 0.01
                ];

            case 'NORMAL':
            default:
                const angle = Math.random() * Math.PI * 2;
                return [
                    this.position[0] + Math.cos(angle) * config.spreadDistance * 0.01,
                    this.position[1] + Math.sin(angle) * config.spreadDistance * 0.01
                ];
        }
    }
}

class VirusSystem {
    constructor() {
        // State management
        this.state = {
            points: [],
            timestamp: Date.now()
        };
        
        // Growth state management
        this.currentState = 'OUTBREAK';
        this.stateStartTime = Date.now();
        this.currentPattern = 'NORMAL';
        
        // Parameters
        this.params = {
            intensity: 0.5,
            colorIntensity: 0.5,
            speed: 0.5,
            pattern: 'NORMAL',
            marketCap: 380000,
            targetCoverage: 40,
            growthMultiplier: GROWTH_STATES.OUTBREAK.multiplier
        };

        // Configuration
        this.maxPoints = 4000;
        this.baseSpreadRadius = 0.04;
        this.lastGrowthTime = Date.now();
        this.growthInterval = 8;
        this.debugMode = true;
        this.autoCycleEnabled = true;

        // Add geospatial controller
        this.geoController = new GeospatialSpawnController();

        // Add population tracking
        this.populationStats = {
            totalInfected: 0,
            infectedByRegion: {},
            lastUpdate: Date.now(),
            affectedPoints: new Set(),
            populationDensity: new Map() // Cache population density calculations
        };
    }

    updateState() {
        const now = Date.now();
        const stateElapsed = now - this.stateStartTime;
        const currentStateConfig = GROWTH_STATES[this.currentState];

        if (stateElapsed >= currentStateConfig.duration) {
            // Transition to next state
            switch (this.currentState) {
                case 'OUTBREAK':
                    this.currentState = 'SETTLEMENT';
                    break;
                case 'SETTLEMENT':
                    this.currentState = 'DORMANT';
                    break;
                case 'DORMANT':
                    this.currentState = 'OUTBREAK';
                    break;
            }
            
            this.stateStartTime = now;
            this.params.growthMultiplier = GROWTH_STATES[this.currentState].multiplier;
            
            if (this.debugMode) {
                console.log('State transition:', {
                    newState: this.currentState,
                    multiplier: this.params.growthMultiplier
                });
            }
        }
    }

    initialize(center) {
        console.log('Initializing virus at center:', center);
        
        // Create initial point
        const initialPoint = new VirusPoint(center, 1.0, this.params.colorIntensity);
        this.state.points = [initialPoint];

        // Add surrounding points
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const offset = 0.05; // Increased for visibility
            const position = [
                center[0] + Math.cos(angle) * offset,
                center[1] + Math.sin(angle) * offset
            ];
            const point = new VirusPoint(position, 1.0, this.params.colorIntensity);
            this.state.points.push(point);
        }

        console.log('Initial points created:', this.state.points.length);
    }

    update(deltaTime = 1/30) {
        // Update state cycle
        if (this.autoCycleEnabled) {
            this.updateState();
        }

        // Update existing points
        const updatedPoints = [];
        this.state.points.forEach(point => {
            // Update point properties
            const updatedPoint = {
                ...point,
                radius: point.radius + (5 * this.params.growthMultiplier * deltaTime),
                intensity: Math.max(0.1, point.intensity - 0.01 * deltaTime),
                age: point.age + 1
            };
            updatedPoints.push(updatedPoint);

            // Generate new points based on pattern
            if (Math.random() < GROWTH_PATTERNS[this.currentPattern].spawnProbability * this.params.growthMultiplier) {
                const newPosition = point.calculateNextPosition(this.currentPattern, this.geoController);
                if (newPosition) {
                    const newPoint = new VirusPoint(
                        newPosition,
                        point.intensity * 0.9,
                        this.params.colorIntensity
                    );
                    newPoint.generation = point.generation + 1;
                    newPoint.spreadPattern = this.currentPattern;
                    updatedPoints.push(newPoint);
                }
            }
        });

        // Update state with new points
        this.state.points = updatedPoints.filter(point => point.intensity > 0.1);

        // Limit total points
        while (this.state.points.length > this.maxPoints) {
            this.state.points.shift();
        }

        if (this.debugMode && this.state.points.length % 100 === 0) {
            console.log('Points count:', this.state.points.length);
        }

        // Update population statistics every second
        if (Date.now() - this.populationStats.lastUpdate > 1000) {
            this.updatePopulationStats();
        }
    }

    updatePopulationStats() {
        // Get all active points
        const activePoints = this.state.points.filter(p => p.intensity > 0.1);
        
        // Calculate total infected population
        this.populationStats.totalInfected = calculateInfectedPopulation(activePoints);
        
        // Calculate infected by region
        ['north-america', 'europe', 'asia', 'africa', 'south-america', 'oceania'].forEach(region => {
            this.populationStats.infectedByRegion[region] = calculateInfectedPopulation(activePoints, region);
        });

        // Update affected points
        activePoints.forEach(point => {
            this.populationStats.affectedPoints.add(`${point.position[0]},${point.position[1]}`);
            
            // Cache population density if not already calculated
            const key = `${point.position[0]},${point.position[1]}`;
            if (!this.populationStats.populationDensity.has(key)) {
                this.populationStats.populationDensity.set(
                    key,
                    getPopulationDensityAtPoint(point.position[0], point.position[1])
                );
            }
        });

        this.populationStats.lastUpdate = Date.now();

        if (this.debugMode) {
            console.log('Population stats updated:', {
                totalInfected: this.populationStats.totalInfected,
                affectedPoints: this.populationStats.affectedPoints.size,
                timestamp: this.populationStats.lastUpdate
            });
        }
    }

    addPoint(x, y, pattern = 'NORMAL') {
        try {
            console.log('Adding virus point at:', [x, y], 'with pattern:', pattern);
            
            // Validate coordinates
            if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
                throw new Error('Invalid coordinates');
            }

            // Validate and set pattern
            if (!GROWTH_PATTERNS[pattern]) {
                console.warn('Invalid pattern:', pattern, 'defaulting to NORMAL');
                pattern = 'NORMAL';
            }
            this.currentPattern = pattern;

            // Create initial point with the specified pattern
            const point = new VirusPoint([x, y], 1.0, this.params.colorIntensity);
            point.spreadPattern = pattern;
            
            // Initialize state with the new point
            this.state.points = [point];

            // Add surrounding points with the same pattern
            const numSurroundingPoints = 4;
            const baseOffset = 0.05;
            
            for (let i = 0; i < numSurroundingPoints; i++) {
                const angle = (i / numSurroundingPoints) * Math.PI * 2;
                const position = [
                    x + Math.cos(angle) * baseOffset,
                    y + Math.sin(angle) * baseOffset
                ];
                const surroundPoint = new VirusPoint(position, 1.0, this.params.colorIntensity);
                surroundPoint.spreadPattern = pattern;
                this.state.points.push(surroundPoint);
            }

            if (this.debugMode) {
                console.log('Virus system initialized:', {
                    points: this.state.points.length,
                    pattern: pattern,
                    currentState: this.currentState,
                    growthMultiplier: this.params.growthMultiplier
                });
            }

            // Calculate initial population impact
            const populationDensity = getPopulationDensityAtPoint(x, y);
            const affectedPopulation = getPopulationAffectedByPoint({ lat: x, lng: y }, this.baseSpreadRadius);

            if (this.debugMode) {
                console.log('Adding point with population impact:', {
                    coordinates: [x, y],
                    populationDensity,
                    affectedPopulation,
                    pattern
                });
            }
        } catch (error) {
            console.error('Error in addPoint:', error);
            throw error;
        }
    }

    setGrowthPattern(pattern) {
        if (GROWTH_PATTERNS[pattern]) {
            this.currentPattern = pattern;
            if (this.debugMode) {
                console.log('Set growth pattern:', pattern);
            }
        }
    }

    getLayers() {
        const layers = [
            new ScatterplotLayer({
                id: 'virus-points',
                data: this.state.points,
                getPosition: d => d.position,
                getRadius: d => {
                    // Adjust radius based on population density
                    const density = this.populationStats.populationDensity.get(
                        `${d.position[0]},${d.position[1]}`
                    ) || 1;
                    return (d.radius * this.params.growthMultiplier) * Math.log10(density + 1);
                },
                getFillColor: d => {
                    const baseColor = GROWTH_PATTERNS[d.spreadPattern || this.currentPattern].color;
                    // Adjust opacity based on population density
                    const density = this.populationStats.populationDensity.get(
                        `${d.position[0]},${d.position[1]}`
                    ) || 1;
                    return [...baseColor, Math.floor(255 * d.colorIntensity * this.params.growthMultiplier * Math.log10(density + 1))];
                },
                pickable: false,
                opacity: 0.8,
                stroked: true,
                lineWidthMinPixels: 1,
                filled: true,
                radiusUnits: 'pixels',
                radiusScale: 1,
                radiusMinPixels: 3,
                radiusMaxPixels: 15,
                parameters: {
                    depthTest: false
                }
            })
        ];

        return layers;
    }

    boostSpread(factor = 2.0) {
        this.params.growthMultiplier *= factor;
        console.log('Boosted spread:', this.params.growthMultiplier);
    }

    suppressSpread(factor = 0.5) {
        this.params.growthMultiplier *= factor;
        console.log('Suppressed spread:', this.params.growthMultiplier);
    }

    // Add method to update predefined points
    updatePredefinedPoints(points) {
        if (this.geoController) {
            this.geoController.updatePoints(points);
            if (this.debugMode) {
                console.log('Updated predefined points in virus system');
            }
        }
    }

    getPopulationStats() {
        return {
            ...this.populationStats,
            populationDensityArray: Array.from(this.populationStats.populationDensity.entries())
                .map(([coords, density]) => ({
                    coordinates: coords.split(',').map(Number),
                    density
                }))
        };
    }
}

export default VirusSystem; 