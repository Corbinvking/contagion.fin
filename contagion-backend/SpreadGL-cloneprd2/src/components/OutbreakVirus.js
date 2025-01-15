import { ScatterplotLayer } from '@deck.gl/layers';

// Growth state definitions
const GROWTH_STATES = {
    OUTBREAK: {
        duration: 2000,    // 2 seconds
        multiplier: 2.0,   // Rapid growth
        sporeActivation: true
    },
    SETTLEMENT: {
        duration: 1500,    // 1.5 seconds
        multiplier: 0.7,   // Gentle recession
        sporeActivation: false
    },
    DORMANT: {
        duration: 750,     // 0.75 seconds
        multiplier: 1.0,   // Maintain size
        sporeActivation: true
    }
};

class OutbreakPoint {
    constructor(position, intensity = 1.0, colorIntensity = 1.0) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.position = position;
        this.intensity = intensity;
        this.colorIntensity = colorIntensity;
        this.age = 0;
        this.active = true;
        this.baseIntensity = intensity;
        this.generation = 0;
        this.isEdge = true;
    }
}

class Territory {
    constructor(gridSize = 0.005) {
        this.points = new Map();
        this.edges = new Set();
        this.gridSize = gridSize;
        this.coverage = 0;
    }

    getGridKey(position) {
        const x = Math.floor(position[0] / this.gridSize);
        const y = Math.floor(position[1] / this.gridSize);
        return `${x},${y}`;
    }

    addPoint(point) {
        const key = this.getGridKey(point.position);
        if (!this.points.has(key)) {
            this.coverage++;
            this.edges.add(key);
            if (this.isPointSurrounded(point.position)) {
                this.edges.delete(key);
                point.isEdge = false;
            }
        }
        this.points.set(key, point);
        return key;
    }

    isPointSurrounded(position) {
        const [x, y] = position;
        return [
            [x + this.gridSize, y],
            [x - this.gridSize, y],
            [x, y + this.gridSize],
            [x, y - this.gridSize]
        ].every(pos => this.points.has(this.getGridKey(pos)));
    }

    getNeighborPositions(position) {
        const [x, y] = position;
        return [
            [x + this.gridSize, y],
            [x - this.gridSize, y],
            [x, y + this.gridSize],
            [x, y - this.gridSize]
        ].filter(pos => !this.points.has(this.getGridKey(pos)));
    }

    removePoint(position) {
        const key = this.getGridKey(position);
        if (this.points.has(key)) {
            this.coverage--;
            this.edges.delete(key);
            this.points.delete(key);
            
            const neighbors = this.getNeighborPositions(position);
            neighbors.forEach(pos => {
                const neighborKey = this.getGridKey(pos);
                if (this.points.has(neighborKey)) {
                    const point = this.points.get(neighborKey);
                    if (!this.isPointSurrounded(pos)) {
                        this.edges.add(neighborKey);
                        point.isEdge = true;
                    }
                }
            });
        }
    }
}

class OutbreakVirus {
    constructor(config = {}) {
        this.points = [];
        this.territory = new Territory(config.gridSize || 0.005);
        
        this.config = {
            maxPoints: config.maxPoints || 4000,
            baseSpreadRadius: config.baseSpreadRadius || 0.04,
            baseIntensity: config.baseIntensity || 1.0,
            color: config.color || [255, 0, 0],
            minRadius: config.minRadius || 3,
            maxRadius: config.maxRadius || 15,
            opacity: config.opacity || 0.8,
            growthInterval: config.growthInterval || 8,
            marketCap: config.marketCap || 380000,
            targetCoverage: config.targetCoverage || 40
        };

        this.currentState = 'DORMANT';
        this.stateStartTime = Date.now();
        this.lastGrowthTime = Date.now();
        this.growthMultiplier = 1.0;
        this.autoCycleEnabled = true;
    }

    initialize(center) {
        this.points = [];
        this.territory = new Territory(this.config.gridSize);
        
        // Create initial cluster
        const initialPoint = new OutbreakPoint(center, 1.0, 1.0);
        this.points.push(initialPoint);
        this.territory.addPoint(initialPoint);

        // Add surrounding points
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const offset = this.territory.gridSize;
            const position = [
                center[0] + Math.cos(angle) * offset,
                center[1] + Math.sin(angle) * offset
            ];
            const point = new OutbreakPoint(position, 1.0, 1.0);
            this.points.push(point);
            this.territory.addPoint(point);
        }
    }

    updateState() {
        const now = Date.now();
        const state = GROWTH_STATES[this.currentState];
        
        if (now - this.stateStartTime >= state.duration) {
            // Cycle to next state
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
            this.growthMultiplier = GROWTH_STATES[this.currentState].multiplier;
        }
    }

    update(deltaTime) {
        if (this.autoCycleEnabled) {
            this.updateState();
        }

        const now = Date.now();
        if (now - this.lastGrowthTime >= this.config.growthInterval) {
            this.updateTerritory();
            this.lastGrowthTime = now;
        }
    }

    updateTerritory() {
        const baseTargetCoverage = Math.max(200, Math.floor(this.config.marketCap / 150));
        const targetCoverage = Math.floor(baseTargetCoverage * this.growthMultiplier);
        const edgePoints = Array.from(this.territory.edges)
            .map(key => this.territory.points.get(key))
            .filter(point => point && point.isEdge);

        // Growth phase
        const baseProb = 0.35;
        const coverageRatio = this.territory.coverage / targetCoverage;
        const growthProb = baseProb * this.growthMultiplier * (1 - Math.pow(coverageRatio, 1.3));

        if (growthProb > 0 || edgePoints.length < 100) {
            const effectiveProb = Math.max(growthProb, edgePoints.length < 100 ? 0.4 : 0);
            
            edgePoints.forEach(point => {
                if (Math.random() < effectiveProb) {
                    const availablePositions = this.territory.getNeighborPositions(point.position);
                    if (availablePositions.length > 0) {
                        const newPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
                        const newPoint = new OutbreakPoint(
                            newPosition,
                            1.0,
                            point.colorIntensity * 0.95
                        );
                        this.points.push(newPoint);
                        this.territory.addPoint(newPoint);
                    }
                }
            });
        }

        // Recession phase
        if (coverageRatio > 1.3) {
            const recessionProb = 0.04 * (coverageRatio - 1.3);
            edgePoints.forEach(point => {
                if (Math.random() < recessionProb) {
                    this.territory.removePoint(point.position);
                    this.points = this.points.filter(p => p !== point);
                }
            });
        }

        // Maintain max points limit
        while (this.points.length > this.config.maxPoints) {
            const oldestPoint = this.points.sort((a, b) => b.age - a.age)[0];
            if (oldestPoint) {
                this.territory.removePoint(oldestPoint.position);
                this.points = this.points.filter(p => p !== oldestPoint);
            }
        }
    }

    getLayer() {
        return new ScatterplotLayer({
            id: 'outbreak-virus-points',
            data: this.points,
            getPosition: d => d.position,
            getRadius: d => this.config.minRadius,
            getFillColor: d => [
                ...this.config.color,
                Math.floor(255 * d.colorIntensity * this.growthMultiplier)
            ],
            pickable: false,
            opacity: this.config.opacity,
            stroked: true,
            strokeWidth: 1,
            filled: true,
            radiusUnits: 'pixels',
            radiusScale: 1,
            radiusMinPixels: this.config.minRadius,
            radiusMaxPixels: this.config.maxRadius,
            parameters: {
                depthTest: false
            }
        });
    }

    // Control methods
    boost() {
        this.currentState = 'OUTBREAK';
        this.stateStartTime = Date.now();
        this.growthMultiplier = GROWTH_STATES.OUTBREAK.multiplier;
    }

    suppress() {
        this.currentState = 'SETTLEMENT';
        this.stateStartTime = Date.now();
        this.growthMultiplier = GROWTH_STATES.SETTLEMENT.multiplier;
    }

    toggleAutoCycle() {
        this.autoCycleEnabled = !this.autoCycleEnabled;
        return this.autoCycleEnabled;
    }

    setMarketCap(marketCap) {
        this.config.marketCap = marketCap;
    }

    clear() {
        this.points = [];
        this.territory = new Territory(this.config.gridSize);
    }
}

export default OutbreakVirus; 