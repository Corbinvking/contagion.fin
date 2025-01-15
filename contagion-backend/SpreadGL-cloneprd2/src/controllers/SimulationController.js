import RouteSystem from '../components/RouteSystem';
import VirusSystem from '../components/VirusSystem';

class SimulationController {
    constructor() {
        this.routeSystem = null;
        this.virusSystem = null;
        this.isRunning = false;
        this.lastUpdate = Date.now();
        this.subscribers = new Set();
        
        // Bind methods
        this.update = this.update.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.getState = this.getState.bind(this);
    }

    async initialize() {
        try {
            console.log('Initializing simulation controller...');
            
            // Initialize route system
            this.routeSystem = new RouteSystem();
            await this.routeSystem.initialize();
            console.log('Route system initialized');

            // Initialize virus system
            this.virusSystem = new VirusSystem();
            this.virusSystem.initialize([-74.006, 40.7128]);
            console.log('Virus system initialized');

            return true;
        } catch (error) {
            console.error('Simulation initialization error:', error);
            return false;
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastUpdate = Date.now();
            this.update();
            console.log('Simulation started');
        }
    }

    stop() {
        this.isRunning = false;
        console.log('Simulation stopped');
    }

    update() {
        if (!this.isRunning) return;

        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        // Update systems
        this.routeSystem?.update(deltaTime);
        this.virusSystem?.update(deltaTime);

        // Get current state
        const state = this.getState();

        // Notify subscribers
        this.notifySubscribers(state);

        // Schedule next update
        requestAnimationFrame(this.update);
    }

    getState() {
        return {
            timestamp: Date.now(),
            layers: {
                route: this.routeSystem?.getLayers() || [],
                virus: this.virusSystem?.getLayers() || []
            },
            status: {
                isRunning: this.isRunning,
                routeSystem: !!this.routeSystem,
                virusSystem: !!this.virusSystem
            }
        };
    }

    // Subscriber management
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(state) {
        this.subscribers.forEach(callback => callback(state));
    }

    // Control methods
    setVirusParams(params) {
        if (this.virusSystem) {
            Object.assign(this.virusSystem.params, params);
            console.log('Updated virus parameters:', params);
        }
    }

    addRoute(type, start, end, speed) {
        if (this.routeSystem) {
            this.routeSystem.addRoute(type, start, end, speed);
            console.log('Added new route:', { type, start, end, speed });
        }
    }

    reset() {
        this.stop();
        this.initialize().then(() => {
            console.log('Simulation reset complete');
            this.start();
        });
    }
}

export default SimulationController; 