import { ScatterplotLayer } from '@deck.gl/layers';

class AirborneVirusPoint {
    constructor(position, intensity = 1.0, colorIntensity = 1.0) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.position = position;
        this.intensity = intensity;
        this.colorIntensity = colorIntensity;
        this.age = 0;
        this.active = true;
        this.radius = 3;
        this.fadeRate = 0.1; // Rate at which points fade out
        this.spreadRate = 0.2; // Rate at which points spread
    }

    update(deltaTime) {
        this.age += deltaTime;
        this.colorIntensity *= (1 - this.fadeRate * deltaTime);
        return this.colorIntensity > 0.1; // Return false when point should be removed
    }
}

class AirborneVirus {
    constructor(config = {}) {
        this.points = new Map();
        this.config = {
            maxPoints: config.maxPoints || 4000,
            baseSpreadRadius: config.baseSpreadRadius || 0.04,
            baseIntensity: config.baseIntensity || 1.0,
            spreadChance: config.spreadChance || 0.3,
            fadeRate: config.fadeRate || 0.1,
            color: config.color || [255, 0, 0],
            minRadius: config.minRadius || 3,
            maxRadius: config.maxRadius || 15,
            opacity: config.opacity || 0.8
        };
    }

    initialize(center) {
        this.points.clear();
        
        // Create initial cluster
        const initialPoint = new AirborneVirusPoint(center, 1.0, 1.0);
        this.points.set(initialPoint.id, initialPoint);

        // Add surrounding points
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const offset = 0.005;
            const position = [
                center[0] + Math.cos(angle) * offset,
                center[1] + Math.sin(angle) * offset
            ];
            const point = new AirborneVirusPoint(position, 1.0, 1.0);
            this.points.set(point.id, point);
        }
    }

    update(deltaTime) {
        // Update existing points
        this.points.forEach((point, id) => {
            if (!point.update(deltaTime)) {
                this.points.delete(id);
                return;
            }

            // Chance to spread
            if (Math.random() < this.config.spreadChance * deltaTime) {
                this.spreadFromPoint(point);
            }
        });

        // Maintain max points limit
        while (this.points.size > this.config.maxPoints) {
            // Remove oldest points first
            const oldestPoint = Array.from(this.points.values())
                .sort((a, b) => b.age - a.age)[0];
            if (oldestPoint) {
                this.points.delete(oldestPoint.id);
            }
        }
    }

    spreadFromPoint(sourcePoint) {
        const angle = Math.random() * Math.PI * 2;
        const distance = this.config.baseSpreadRadius * (0.2 + Math.random() * 0.2);
        
        const newPosition = [
            sourcePoint.position[0] + Math.cos(angle) * distance,
            sourcePoint.position[1] + Math.sin(angle) * distance
        ];

        const newPoint = new AirborneVirusPoint(
            newPosition,
            sourcePoint.intensity * 0.98,
            sourcePoint.colorIntensity * 0.95
        );
        
        this.points.set(newPoint.id, newPoint);
    }

    getLayer() {
        return new ScatterplotLayer({
            id: 'airborne-virus-points',
            data: Array.from(this.points.values()),
            getPosition: d => d.position,
            getRadius: d => d.radius,
            getFillColor: d => [
                ...this.config.color,
                Math.floor(255 * d.colorIntensity)
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

    // Utility methods
    setColor(color) {
        this.config.color = color;
    }

    setOpacity(opacity) {
        this.config.opacity = opacity;
    }

    setSpreadRate(rate) {
        this.config.spreadChance = rate;
    }

    setFadeRate(rate) {
        this.config.fadeRate = rate;
        this.points.forEach(point => point.fadeRate = rate);
    }

    getPoints() {
        return Array.from(this.points.values());
    }

    clear() {
        this.points.clear();
    }
}

export default AirborneVirus; 