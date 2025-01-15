import { ScatterplotLayer } from '@deck.gl/layers';

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

    calculateNextPosition(pattern = 'NORMAL') {
        const config = GROWTH_PATTERNS[pattern];
        const now = Date.now();
        
        if (now - this.lastSpreadTime < config.tickRate) {
            return null;
        }

        let newPosition;
        switch (pattern) {
            case 'VECTOR':
                // Directional spread with slight variation
                newPosition = [
                    this.position[0] + Math.cos(this.direction) * config.spreadDistance * 0.01,
                    this.position[1] + Math.sin(this.direction) * config.spreadDistance * 0.01
                ];
                this.direction += (Math.random() - 0.5) * 0.3;
                break;

            case 'BURST':
                // Explosive spread in random directions
                const burstAngle = Math.random() * Math.PI * 2;
                const burstDistance = (0.5 + Math.random() * 0.5) * config.spreadDistance;
                newPosition = [
                    this.position[0] + Math.cos(burstAngle) * burstDistance * 0.01,
                    this.position[1] + Math.sin(burstAngle) * burstDistance * 0.01
                ];
                break;

            case 'NORMAL':
            default:
                // Standard radial spread
                const angle = Math.random() * Math.PI * 2;
                newPosition = [
                    this.position[0] + Math.cos(angle) * config.spreadDistance * 0.01,
                    this.position[1] + Math.sin(angle) * config.spreadDistance * 0.01
                ];
                break;
        }

        this.lastSpreadTime = now;
        return newPosition;
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
                const newPosition = point.calculateNextPosition(this.currentPattern);
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
        return [new ScatterplotLayer({
            id: 'virus-points',
            data: this.state.points,
            getPosition: d => d.position,
            getRadius: d => d.radius * this.params.growthMultiplier,
            getFillColor: d => {
                const baseColor = GROWTH_PATTERNS[d.spreadPattern || this.currentPattern].color;
                return [...baseColor, Math.floor(255 * d.colorIntensity * this.params.growthMultiplier)];
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
        })];
    }

    boostSpread(factor = 2.0) {
        this.params.growthMultiplier *= factor;
        console.log('Boosted spread:', this.params.growthMultiplier);
    }

    suppressSpread(factor = 0.5) {
        this.params.growthMultiplier *= factor;
        console.log('Suppressed spread:', this.params.growthMultiplier);
    }
}

export default VirusSystem; 