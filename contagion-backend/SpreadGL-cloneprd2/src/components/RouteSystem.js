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

    setupIconAtlas() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 64, 32);

        // Draw plane icon with enhanced design
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        // Main triangle
        ctx.beginPath();
        ctx.moveTo(16, 6);
        ctx.lineTo(4, 26);
        ctx.lineTo(28, 26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Small wings
        ctx.beginPath();
        ctx.moveTo(12, 20);
        ctx.lineTo(20, 20);
        ctx.lineTo(16, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw ship icon
        ctx.beginPath();
        ctx.moveTo(36, 20);
        ctx.lineTo(42, 8);
        ctx.lineTo(56, 8);
        ctx.lineTo(60, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        this.iconAtlas = canvas;
        this.createLayers();
    }

    createLayers() {
        // Path Layer
        this.pathLayer = new PathLayer({
            id: 'route-paths',
            data: this.routes,
            getPath: d => [d.start, d.end],
            getColor: [255, 255, 255],
            getWidth: 2,
            widthMinPixels: 2,
            pickable: true,
            opacity: 0.8,
            getDashArray: [6, 4],
            parameters: {
                depthTest: false
            }
        });

        // Endpoint Layer (fixed deprecation warning)
        this.endpointLayer = new ScatterplotLayer({
            id: 'route-endpoints',
            data: this.getEndpoints(),
            getPosition: d => d.position,
            getFillColor: d => d.color,
            getRadius: 5,
            radiusMinPixels: 3,
            pickable: true,
            parameters: {
                depthTest: false
            }
        });

        // Vehicle Layer with fixed animation
        this.vehicleLayer = new IconLayer({
            id: 'vehicle-layer',
            data: this.vehicles,
            iconAtlas: this.iconAtlas,
            iconMapping: {
                plane: { x: 0, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 },
                ship: { x: 32, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 }
            },
            getIcon: d => d.type,
            getPosition: d => this.getVehiclePosition(d),
            getSize: d => d.type === 'plane' ? 32 : 28,
            getAngle: d => {
                const [fromPoint, toPoint] = d.isReturning ? [d.end, d.start] : [d.start, d.end];
                const angle = Math.atan2(
                    toPoint[1] - fromPoint[1],
                    toPoint[0] - fromPoint[0]
                ) * 180 / Math.PI;
                return angle + 90;
            },
            sizeScale: 1,
            sizeUnits: 'pixels',
            sizeMinPixels: 16,
            sizeMaxPixels: 32,
            pickable: true,
            parameters: {
                depthTest: false
            }
        });

        this.labelLayer = new TextLayer({
            id: 'endpoint-labels',
            data: this.getEndpoints(),
            getPosition: d => d.position,
            getText: d => d.label,
            getSize: 12,
            getColor: [255, 255, 255],
            getAngle: 0,
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            getPixelOffset: [0, -15],
            parameters: {
                depthTest: false
            }
        });
    }

    getEndpoints() {
        const endpoints = [];
        this.routes.forEach((route, index) => {
            const routePrefix = route.type === 'plane' ? 'A' : 'C';
            const destinationPrefix = route.type === 'plane' ? 'B' : 'D';
            
            endpoints.push({
                position: route.start,
                isStart: true,
                routeId: index,
                label: `${routePrefix}${index}`,
                color: [255, 165, 0]  // Orange for start
            });
            endpoints.push({
                position: route.end,
                isStart: false,
                routeId: index,
                label: `${destinationPrefix}${index}`,
                color: [0, 0, 255]    // Blue for end
            });
        });
        return endpoints;
    }

    getVehiclePosition(vehicle) {
        if (!vehicle || !vehicle.start || !vehicle.end) return [0, 0];
        
        const [fromPoint, toPoint] = vehicle.isReturning ? 
            [vehicle.end, vehicle.start] : 
            [vehicle.start, vehicle.end];
        
        return [
            fromPoint[0] + (toPoint[0] - fromPoint[0]) * vehicle.progress,
            fromPoint[1] + (toPoint[1] - fromPoint[1]) * vehicle.progress
        ];
    }

    update() {
        if (!this.vehicles.length) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        let needsUpdate = false;

        this.vehicles.forEach(vehicle => {
            const oldProgress = vehicle.progress;
            vehicle.progress += deltaTime * vehicle.speed;

            if (vehicle.progress >= 1) {
                vehicle.progress = 0;
                vehicle.isReturning = !vehicle.isReturning;
            }

            if (Math.abs(oldProgress - vehicle.progress) > 0.0001) {
                needsUpdate = true;
            }
        });

        // Always update the vehicle layer
        this.vehicleLayer = this.createVehicleLayer();
    }

    getLayers() {
        return [this.pathLayer, this.endpointLayer, this.labelLayer, this.vehicleLayer].filter(Boolean);
    }

    addRoute(type, start, end, speed) {
        // Set default speeds according to documentation
        const defaultSpeed = type === 'plane' ? 0.1 : 0.05;
        speed = speed || defaultSpeed;

        const routeId = this.routes.length;
        this.routes.push({ start, end, type, id: routeId });
        this.vehicles.push({
            type,
            start,
            end,
            progress: 0,
            speed,
            routeId,
            isReturning: false,
            lastUpdate: Date.now()
        });
        this.createLayers();
    }

    initialize() {
        // Air Routes (11)
        this.addRoute(
            'plane',
            [-73.7781, 40.6413],      // New York (JFK)
            [-0.4614, 51.4700],       // London (Heathrow)
            0.1
        );

        this.addRoute(
            'plane',
            [55.3644, 25.2532],       // Dubai
            [103.9915, 1.3644],       // Singapore (Changi)
            0.1
        );

        this.addRoute(
            'plane',
            [2.5559, 49.0083],        // Paris (CDG)
            [151.1772, -33.9462],     // Sydney
            0.1
        );

        this.addRoute(
            'plane',
            [151.1772, -33.9462],     // Sydney
            [103.9915, 1.3644],       // Singapore (Changi)
            0.1
        );

        this.addRoute(
            'plane',
            [55.3644, 25.2532],       // Dubai (DXB)
            [28.2460, -26.1367],      // Johannesburg (JNB)
            0.1
        );

        this.addRoute(
            'plane',
            [2.5559, 49.0083],        // Paris (CDG)
            [31.4117, 30.1114],       // Cairo (CAI)
            0.1
        );

        this.addRoute(
            'plane',
            [-79.6248, 43.6777],      // Toronto (YYZ)
            [8.5622, 50.0379],        // Frankfurt (FRA)
            0.1
        );

        this.addRoute(
            'plane',
            [116.5847, 40.0799],      // Beijing (PEK)
            [37.4146, 55.9726],       // Moscow (SVO)
            0.1
        );

        this.addRoute(
            'plane',
            [-46.4825, -23.4356],     // São Paulo (GRU)
            [-80.2870, 25.7959],      // Miami (MIA)
            0.1
        );

        this.addRoute(
            'plane',
            [77.1015, 28.5555],       // Delhi (DEL)
            [100.7501, 13.6900],      // Bangkok (BKK)
            0.1
        );

        this.addRoute(
            'plane',
            [-99.0721, 19.4361],      // Mexico City (MEX)
            [-3.5626, 40.4719],       // Madrid (MAD)
            0.1
        );

        // Ship Routes (5)
        this.addRoute(
            'ship',
            [-122.4194, 37.7749],     // San Francisco
            [-149.9003, 61.2181],     // Anchorage
            0.05
        );

        this.addRoute(
            'ship',
            [139.6917, 35.6895],      // Tokyo
            [132.4553, 34.3853],      // Hiroshima
            0.05
        );

        this.addRoute(
            'ship',
            [132.4553, 34.3853],      // Hiroshima
            [127.6791, 26.2124],      // Okinawa
            0.05
        );

        this.addRoute(
            'ship',
            [127.6791, 26.2124],      // Okinawa
            [151.1772, -33.9462],     // Sydney
            0.05
        );

        this.addRoute(
            'ship',
            [-46.3225, -23.9619],     // Santos (Brazil)
            [18.4241, -33.9249],      // Cape Town
            0.05
        );
    }

    handleEndpointClick(endpointInfo) {
        const { routeId, isStart, label } = endpointInfo;
        console.log(`Clicked ${label} - ${isStart ? 'Start' : 'End'} of route ${routeId}`);
    }

    createVehicleLayer() {
        if (!this.iconAtlas) {
            console.log('No icon atlas available');
            return null;
        }

        return new IconLayer({
            id: 'vehicle-layer',
            data: this.vehicles,
            iconAtlas: this.iconAtlas,
            iconMapping: {
                plane: { x: 0, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 },
                ship: { x: 32, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 }
            },
            getIcon: d => d.type,
            getPosition: d => this.getVehiclePosition(d),
            getSize: d => d.type === 'plane' ? 32 : 28,
            getAngle: d => {
                const [fromPoint, toPoint] = d.isReturning ? [d.end, d.start] : [d.start, d.end];
                const angle = Math.atan2(
                    toPoint[1] - fromPoint[1],
                    toPoint[0] - fromPoint[0]
                ) * 180 / Math.PI;
                return angle + 90;
            },
            sizeScale: 1,
            sizeUnits: 'pixels',
            sizeMinPixels: 16,
            sizeMaxPixels: 32,
            pickable: true,
            updateTriggers: {
                getPosition: [Date.now()],
                getAngle: [Date.now()]
            },
            parameters: {
                depthTest: false
            }
        });
    }
}

export default RouteSystem; 