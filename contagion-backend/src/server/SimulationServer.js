import { WebSocketServer } from 'ws';
import { BitqueryService } from '../market-data/real/BitqueryService.js';
import { MarketDataStream } from '../market-data/real/MarketDataStream.js';
import { MarketToVirusTranslator } from '../market-data/real/MarketToVirusTranslator.js';

class RouteSystem {
  constructor() {
    this.vehicles = [];
    this.routes = [];
    this.lastUpdate = Date.now();
  }

  setupIconAtlas() {
    // Server-side we don't need actual canvas or icon atlas
    return {
      width: 64,
      height: 32,
      data: new Uint8Array(64 * 32 * 4) // RGBA data
    };
  }

  getEndpoints() {
    const endpoints = [];
    this.routes.forEach((route, i) => {
      const startLabel = route.type === 'plane' ? 'A' : 'C';
      const endLabel = route.type === 'plane' ? 'B' : 'D';
      
      endpoints.push({
        position: route.start,
        isStart: true,
        routeId: i,
        label: `${startLabel}${i}`,
        color: [255, 165, 0]
      });
      
      endpoints.push({
        position: route.end,
        isStart: false,
        routeId: i,
        label: `${endLabel}${i}`,
        color: [0, 0, 255]
      });
    });
    return endpoints;
  }

  getVehiclePosition(vehicle) {
    if (!vehicle || !vehicle.start || !vehicle.end) return [0, 0];
    const [start, end] = vehicle.isReturning ? [vehicle.end, vehicle.start] : [vehicle.start, vehicle.end];
    return [
      start[0] + (end[0] - start[0]) * vehicle.progress,
      start[1] + (end[1] - start[1]) * vehicle.progress
    ];
  }

  update(deltaTime) {
    if (!this.vehicles.length) return;

    this.vehicles.forEach(vehicle => {
      vehicle.progress += deltaTime * vehicle.speed;
      if (vehicle.progress >= 1) {
        vehicle.progress = 0;
        vehicle.isReturning = !vehicle.isReturning;
      }
    });
  }

  getLayers() {
    // Return layer data instead of deck.gl layer instances
    return {
      paths: {
        id: 'route-paths',
        data: this.routes,
        getPath: d => [d.start, d.end],
        getColor: [255, 255, 255],
        getWidth: 2,
        widthMinPixels: 2,
        opacity: 0.8,
        getDashArray: [6, 4]
      },
      endpoints: {
        id: 'route-endpoints',
        data: this.getEndpoints(),
        getPosition: d => d.position,
        getFillColor: d => d.color,
        getRadius: 5,
        radiusMinPixels: 3
      },
      vehicles: {
        id: 'vehicle-layer',
        data: this.vehicles.map(v => ({
          ...v,
          position: this.getVehiclePosition(v),
          angle: (() => {
            const [start, end] = v.isReturning ? [v.end, v.start] : [v.start, v.end];
            return (Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI) + 90;
          })()
        })),
        iconAtlas: this.setupIconAtlas(),
        iconMapping: {
          plane: { x: 0, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 },
          ship: { x: 32, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 }
        }
      }
    };
  }

  addRoute(type, start, end, speed = type === 'plane' ? 0.1 : 0.05) {
    const id = this.routes.length;
    this.routes.push({ start, end, type, id });
    this.vehicles.push({
      type,
      start,
      end,
      progress: 0,
      speed,
      routeId: id,
      isReturning: false,
      lastUpdate: Date.now()
    });
  }

  async initialize() {
    // Add initial routes
    this.addRoute('plane', [-73.7781, 40.6413], [-0.4614, 51.47]);
    this.addRoute('ship', [-122.4194, 37.7749], [-149.9003, 61.2181]);
    return true;
  }
}

class VirusSystem {
  constructor() {
    this.state = {
      points: [],
      persistentZones: new Map(),
      timestamp: Date.now()
    };
    this.params = {
      intensity: 0.5,
      colorIntensity: 0.5,
      speed: 0.5,
      growthMultiplier: 1,
      minMultiplier: 0.1,
      maxMultiplier: 5.0,
      baseRadius: 10,
      spreadRadius: 0.5,
      pointGenerationRate: 0.1,
      gridSize: 0.5,
      minCoverage: 0.001,
      // New parameters for persistence
      zoneMaturityAge: 100,        // Age at which a point becomes part of a persistent zone
      zoneRadius: 0.2,             // Radius of persistent zones
      persistentPointDensity: 0.5,  // Density of points in persistent zones
      minIntensity: 0.05,          // Minimum intensity before point becomes dormant
      intensityDecayRate: 0.005,   // How fast intensity decays
      dormantIntensity: 0.3,       // Intensity for dormant points
      minActiveIntensity: 0.1      // Minimum intensity for active points
    };
    
    // Memory management
    this.maxPoints = 12000;          // Increased for active points
    this.pointChunkSize = 1000;      // Process points in chunks
    this.cleanupThreshold = 0.2;     // Trigger cleanup at 20% inactive points
    this.lastCleanup = Date.now();
    this.cleanupInterval = 5000;     // Cleanup every 5 seconds
    
    // Enhanced point tracking
    this.pointTracking = {
      activePoints: new Set(),        // Track unique active points
      persistentPoints: new Set(),    // Track unique persistent points
      totalGenerated: 0,             // Total points ever generated
      lastPruned: 0                  // Last time points were pruned
    };
    
    // Performance tracking
    this.performanceMetrics = {
      totalPointsGenerated: 0,
      totalPointsRemoved: 0,
      activePoints: 0,
      persistentZones: 0,
      lastUpdateTime: 0,
      updateDuration: 0,
      memoryUsage: process.memoryUsage()
    };
    
    // Coverage tracking
    this.infectedCells = new Set();
    this.totalCells = 0;
    
    // Spore tracking
    this.activeSpores = new Map();
    this.nextSporeId = 1;
    this.sporeMetrics = {
      totalSporesCreated: 0,
      activeSporeCount: 0,
      pointsPerSpore: new Map()
    };
    
    this.debugMode = true;
    this.initializeCoverageGrid();
  }

  initializeCoverageGrid() {
    // Initialize grid for the visible map area
    const mapBounds = {
      minLat: -90,
      maxLat: 90,
      minLng: -180,
      maxLng: 180
    };

    this.totalCells = Math.floor(
      ((mapBounds.maxLat - mapBounds.minLat) / this.params.gridSize) *
      ((mapBounds.maxLng - mapBounds.minLng) / this.params.gridSize)
    );

    // Clear existing infected cells
    this.infectedCells.clear();

    if (this.debugMode) {
      console.log('Coverage grid initialized:', {
        gridSize: this.params.gridSize,
        totalCells: this.totalCells,
        bounds: mapBounds
      });
    }
  }

  getGridCell(position) {
    const x = Math.floor(position[0] / this.params.gridSize);
    const y = Math.floor(position[1] / this.params.gridSize);
    return `${x},${y}`;
  }

  updateCoverage() {
    // Clear existing infected cells
    this.infectedCells.clear();
    
    // Track cells for each point in chunks for better performance
    for (let i = 0; i < this.state.points.length; i += this.pointChunkSize) {
      const chunk = this.state.points.slice(i, Math.min(i + this.pointChunkSize, this.state.points.length));
      chunk.forEach(point => {
        if (point.intensity >= this.params.minCoverage) {
          this.infectedCells.add(this.getGridCell(point.position));
        }
      });
    }

    // Calculate coverage percentage
    const coverage = this.infectedCells.size / this.totalCells;
    
    if (this.debugMode && this.state.points.length % 1000 === 0) {
      console.log('Coverage update:', {
        infectedCells: this.infectedCells.size,
        totalCells: this.totalCells,
        coverage: (coverage * 100).toFixed(2) + '%',
        activePoints: this.state.points.length
      });
    }

    return coverage;
  }

  addPoint(coordinates, pattern = 'NORMAL') {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error('Invalid coordinates format');
    }

    const sporeId = this.nextSporeId++;
    const spore = {
      id: sporeId,
      position: coordinates,
      pattern: pattern,
      points: [],
      coverage: 0,
      createdAt: Date.now(),
      activePoints: 0,
      dormantPoints: 0,
      infectedCells: new Set([this.getGridCell(coordinates)])
    };

    this.activeSpores.set(sporeId, spore);
    this.sporeMetrics.totalSporesCreated++;
    this.sporeMetrics.activeSporeCount = this.activeSpores.size;

    // Initialize points for this spore
    const point = {
      position: coordinates,
      intensity: this.params.intensity,
      colorIntensity: this.params.colorIntensity,
      radius: this.params.baseRadius,
      age: 0,
      active: true,
      sporeId: sporeId,
      pattern: pattern  // Set pattern for initial point
    };

    this.state.points.push(point);
    spore.points.push(point);
    spore.activePoints++;

    if (this.debugMode) {
      console.log(`Added new spore #${sporeId} at [${coordinates}] with pattern ${pattern}`);
    }

    return sporeId;
  }

  createInitialPoints(center, sporeId) {
    const points = [];
    const baseId = `${sporeId}_${Date.now()}`;
    
    // Create center point
    points.push({
      id: `${baseId}_0`,
      position: center,
      intensity: 1,
      colorIntensity: this.params.colorIntensity,
      age: 0,
      active: true,
      radius: this.params.baseRadius,
      sporeId
    });

    // Create surrounding points
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const pos = [
        center[0] + 0.05 * Math.cos(angle),
        center[1] + 0.05 * Math.sin(angle)
      ];
      points.push({
        id: `${baseId}_${i + 1}`,
        position: pos,
        intensity: 1,
        colorIntensity: this.params.colorIntensity,
        age: 0,
        active: true,
        radius: this.params.baseRadius,
        sporeId
      });
    }
    
    return points;
  }

  getTotalPoints() {
    return {
      active: this.pointTracking.activePoints.size,
      persistent: this.pointTracking.persistentPoints.size,
      total: this.pointTracking.activePoints.size + this.pointTracking.persistentPoints.size,
      generated: this.pointTracking.totalGenerated
    };
  }

  cleanupInactivePoints() {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupInterval) return;

    const initialLength = this.state.points.length;
    
    // Remove inactive points in chunks
    for (let i = 0; i < this.state.points.length; i += this.pointChunkSize) {
      const chunk = this.state.points.slice(i, i + this.pointChunkSize);
      const activeChunk = chunk.filter(point => point.intensity > 0.1);
      this.state.points.splice(i, chunk.length, ...activeChunk);
    }

    // Update metrics
    const removedCount = initialLength - this.state.points.length;
    this.performanceMetrics.totalPointsRemoved += removedCount;
    this.performanceMetrics.activePoints = this.state.points.length;
    
    // Update memory usage
    this.performanceMetrics.memoryUsage = process.memoryUsage();
    this.lastCleanup = now;

    if (this.debugMode && removedCount > 0) {
      console.log('Cleanup completed:', {
        removedPoints: removedCount,
        remainingPoints: this.state.points.length,
        heapUsed: Math.round(this.performanceMetrics.memoryUsage.heapUsed / 1024 / 1024) + 'MB'
      });
    }
  }

  convertToZone(points, sporeId) {
    const center = points.reduce((acc, p) => [
      acc[0] + p.position[0] / points.length,
      acc[1] + p.position[1] / points.length
    ], [0, 0]);

    const zone = {
      id: `zone_${sporeId}_${Date.now()}`,
      center,
      radius: this.params.zoneRadius,
      intensity: 0.8,
      colorIntensity: this.params.colorIntensity,
      createdAt: Date.now(),
      sporeId
    };

    this.state.persistentZones.set(zone.id, zone);
    this.performanceMetrics.persistentZones = this.state.persistentZones.size;

    if (this.debugMode) {
      console.log('Created persistent zone:', {
        id: zone.id,
        center,
        totalZones: this.state.persistentZones.size
      });
    }

    return zone;
  }

  update(deltaTime) {
    const updateStart = Date.now();

    // Update active points
    for (let i = 0; i < this.state.points.length; i += this.pointChunkSize) {
      const chunk = this.state.points.slice(i, i + this.pointChunkSize);
      const updatedChunk = chunk.map(point => {
        // Calculate new intensity with slower decay
        const newIntensity = point.active ? 
          Math.max(this.params.minIntensity, point.intensity - this.params.intensityDecayRate * deltaTime) :
          this.params.dormantIntensity;

        const updated = {
      ...point,
          radius: point.radius + (this.params.baseRadius * this.params.growthMultiplier * deltaTime),
          intensity: newIntensity,
      age: point.age + 1
        };

        // Transition point state based on intensity
        if (point.active && newIntensity <= this.params.minActiveIntensity) {
          updated.active = false;
          const spore = this.activeSpores.get(point.sporeId);
          if (spore) {
            spore.activePoints--;
            spore.dormantPoints++;
          }
        }

        return updated;
      });
      this.state.points.splice(i, chunk.length, ...updatedChunk);
    }

    // Generate new points from active spores
    for (const [sporeId, spore] of this.activeSpores) {
      // Only generate new points if we have active source points
      const activeSourcePoints = this.state.points.filter(p => 
        p.sporeId === sporeId && p.active && p.intensity > this.params.minActiveIntensity
      );

      if (activeSourcePoints.length > 0) {
        const pointsToGenerate = Math.floor(this.params.pointGenerationRate * this.params.growthMultiplier * 10);
        for (let i = 0; i < pointsToGenerate; i++) {
          const sourcePoint = activeSourcePoints[Math.floor(Math.random() * activeSourcePoints.length)];
          
        const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * this.params.spreadRadius;
        const newPos = [
          sourcePoint.position[0] + Math.cos(angle) * distance,
          sourcePoint.position[1] + Math.sin(angle) * distance
        ];
          
        const newPoint = {
          position: newPos,
          intensity: sourcePoint.intensity * 0.9,
          colorIntensity: this.params.colorIntensity,
          age: 0,
          active: true,
            radius: this.params.baseRadius,
            sporeId: sporeId,
            pattern: spore.pattern  // Inherit pattern from the spore
        };
          
        this.state.points.push(newPoint);
          spore.points.push(newPoint);
          spore.activePoints++;
          spore.infectedCells.add(this.getGridCell(newPos));
        }
      }
      
      // Update spore coverage
      spore.coverage = spore.infectedCells.size / this.totalCells;
    }

    // Update metrics
    this.performanceMetrics.lastUpdateTime = updateStart;
    this.performanceMetrics.updateDuration = Date.now() - updateStart;
    this.performanceMetrics.activePoints = this.state.points.length;

    if (this.debugMode && this.state.points.length % 1000 === 0) {
      console.log('Performance update:', {
        activePoints: this.performanceMetrics.activePoints,
        updateTime: this.performanceMetrics.updateDuration + 'ms',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
      });
    }
  }

  getState() {
    const coverage = this.updateCoverage();
    const points = this.getTotalPoints();
    const sporeStates = Array.from(this.activeSpores.entries()).map(([id, spore]) => ({
      id,
      position: spore.position,
      pattern: spore.pattern || 'NORMAL',
      activePoints: spore.activePoints,
      dormantPoints: spore.dormantPoints,
      totalPoints: spore.points.length,
      coverage: spore.coverage,
      age: (Date.now() - spore.createdAt) / 1000
    }));

    return {
      points: this.state.points,
      activeSpores: this.activeSpores.size,
      sporeStates,
      coverage,
      pointStats: points,
      params: this.params,
      performance: this.performanceMetrics,
      timestamp: Date.now()
    };
  }

  boostSpread(factor = 2.0) {
    const newMultiplier = this.params.growthMultiplier * factor;
    this.params.growthMultiplier = Math.min(newMultiplier, this.params.maxMultiplier);
    
    if (this.debugMode) {
      console.log('Boosted spread:', {
        oldMultiplier: newMultiplier / factor,
        newMultiplier: this.params.growthMultiplier,
        maxLimit: this.params.maxMultiplier
      });
    }
  }

  suppressSpread(factor = 0.5) {
    const newMultiplier = this.params.growthMultiplier * factor;
    this.params.growthMultiplier = Math.max(newMultiplier, this.params.minMultiplier);
    
    if (this.debugMode) {
      console.log('Suppressed spread:', {
        oldMultiplier: newMultiplier / factor,
        newMultiplier: this.params.growthMultiplier,
        minLimit: this.params.minMultiplier
      });
    }
  }

  getLayers() {
    return {
      points: {
        id: 'virus-points',
        data: this.state.points
      },
      sporeStates: Array.from(this.activeSpores.values()).map(spore => ({
        id: spore.id,
        position: spore.position,
        pattern: spore.pattern || 'NORMAL',
        pointCount: spore.points ? spore.points.length : 0,
        coverage: spore.coverage || 0,
        age: (Date.now() - spore.createdAt) / 1000
      })),
      activeSpores: this.activeSpores.size,
      coverage: this.updateCoverage(),
      params: this.params,
      currentState: this.currentState || 'DORMANT'
    };
  }
}

class SimulationController {
  constructor() {
    this.routeSystem = null;
    this.virusSystem = null;
    this.isRunning = false;
    this.lastUpdate = Date.now();
    this.subscribers = new Set();
    this.updateInterval = null;

    this.update = this.update.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.getState = this.getState.bind(this);
  }

  async initialize() {
      this.routeSystem = new RouteSystem();
      await this.routeSystem.initialize();

      this.virusSystem = new VirusSystem();
    console.log('Initialized virus system');

    this.isRunning = false;
    this.lastUpdate = Date.now();
      return true;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastUpdate = Date.now();
      this.updateInterval = setInterval(this.update, 1000 / 30); // 30 FPS
      console.log('Simulation started');
    }
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Simulation stopped');
  }

  update() {
    if (!this.isRunning) return;

    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    this.routeSystem?.update(deltaTime);
    this.virusSystem?.update(deltaTime);

    const state = this.getState();
    this.notifySubscribers(state);
  }

  getState() {
    return {
      timestamp: Date.now(),
      layers: {
        route: this.routeSystem?.getLayers() || {},
        virus: {
          ...this.virusSystem?.getLayers() || {},
          activeSpores: this.virusSystem?.activeSpores.size || 0,
          coverage: this.virusSystem?.updateCoverage() || 0,
          sporeStates: this.virusSystem?.getState().sporeStates || [],
          params: this.virusSystem?.params || {},
          currentState: this.virusSystem?.currentState || 'UNKNOWN'
        }
      },
      status: {
        isRunning: this.isRunning,
        routeSystem: !!this.routeSystem,
        virusSystem: !!this.virusSystem
      }
    };
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(state) {
    this.subscribers.forEach(callback => callback(state));
  }

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

class SimulationServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.simulation = null;
    this.clients = new Set();
    this.debugMode = true;

    // Initialize market data components
    this.marketDataStream = new MarketDataStream({
      interval: 10000,  // 10 seconds for development
      windowSize: 5     // Keep last 5 data points
    });

    this.marketTranslator = new MarketToVirusTranslator({
      debug: true,
      volumeChangeThreshold: 5,    // 5% change
      volatilityThreshold: 10,     // 10% change
      baseGrowthMultiplier: 1.5,
      maxGrowthMultiplier: 3.0
    });

    // Bind methods
    this.handleConnection = this.handleConnection.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.broadcast = this.broadcast.bind(this);
    this.handleMarketData = this.handleMarketData.bind(this);
  }

  async initialize() {
    try {
      console.log('Initializing simulation server...');
      
      // Initialize simulation components
      this.simulation = new SimulationController();
      await this.simulation.initialize();
    
      // Setup WebSocket server
      this.wss.on('connection', this.handleConnection);
    
      // Start market data stream
      this.marketDataStream.on('data', this.handleMarketData);
      this.marketDataStream.on('error', (error) => {
        console.error('Market data stream error:', error);
      });
      this.marketDataStream.start();

      // Start broadcasting updates
      setInterval(() => {
        if (this.simulation.isRunning) {
          const state = this.simulation.getState();
          this.broadcast('simulation_update', state);
        }
      }, 16);

      console.log('Simulation server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize simulation server:', error);
      throw error;
    }
  }

  handleConnection(ws) {
    console.log('Client connected');
    this.clients.add(ws);
    
    // Send initial state
    ws.send(JSON.stringify({
      type: 'initial_state',
      data: this.simulation.getState()
    }));
    
    ws.on('message', (message) => this.handleMessage(ws, message));
    ws.on('close', () => {
      console.log('Client disconnected');
      this.clients.delete(ws);
    });
  }

  broadcast(type, data) {
    const message = JSON.stringify({ type, data });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  handleMessage(ws, message) {
    try {
      const { type, data } = JSON.parse(message);
      
      switch (type) {
        case 'request_state':
          ws.send(JSON.stringify({
            type: 'simulation_update',
            data: this.simulation.getState()
          }));
          break;
        case 'control':
          const result = this.handleControl(data.action, data.params);
          ws.send(JSON.stringify({
            type: 'control_response',
            data: result
          }));
          break;
        default:
          console.warn('Unknown message type:', type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: error.message }
      }));
    }
  }

  handleVirusSpawn(coordinates, pattern = 'NORMAL') {
    if (!this.simulation?.virusSystem) {
      throw new Error('Virus system not initialized');
    }

    console.log('Received spawn request:', { coordinates, pattern });

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      console.error('Invalid coordinates format:', coordinates);
      throw new Error('Invalid coordinates format');
    }

    const [x, y] = coordinates;
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      console.error('Invalid coordinate values:', { x, y });
      throw new Error('Invalid coordinate values');
    }

    if (x < -180 || x > 180 || y < -90 || y > 90) {
      console.error('Coordinates out of valid range:', { x, y });
      throw new Error('Coordinates out of valid range');
    }

    // Validate pattern
    if (!pattern || !['NORMAL', 'VECTOR', 'BURST'].includes(pattern)) {
      console.warn('Invalid pattern provided:', pattern, 'defaulting to NORMAL');
      pattern = 'NORMAL';
    }

    console.log('Spawning virus at:', coordinates, 'with pattern:', pattern);
    const sporeId = this.simulation.virusSystem.addPoint(coordinates, pattern);
    
    return {
      success: true,
      sporeId,
      coordinates,
      pattern,
      state: this.simulation.getState()
    };
  }

  handleVirusControl(action, data) {
    if (!this.simulation?.virusSystem) {
      throw new Error('Virus system not initialized');
    }

    console.log('Handling virus control:', { action, data });

    switch (action) {
      case 'virus_spawn':
        if (!data?.params?.coordinates) {
          console.error('Missing coordinates in spawn request');
          throw new Error('Missing coordinates in spawn request');
        }
        return this.handleVirusSpawn(data.params.coordinates, data.params.pattern);
      case 'virus_boost':
        this.simulation.virusSystem.boostSpread();
        break;
      case 'virus_suppress':
        this.simulation.virusSystem.suppressSpread();
        break;
      case 'virus_param_update':
        const { param, value } = data.params;
        if (param in this.simulation.virusSystem.params) {
          this.simulation.virusSystem.params[param] = value;
        } else {
          throw new Error(`Invalid parameter: ${param}`);
        }
        break;
      default:
        throw new Error(`Unknown virus action: ${action}`);
    }

    return {
      success: true,
      state: this.simulation.getState()
    };
  }

  handleRouteControl(action, data) {
    if (!this.simulation?.routeSystem) {
      throw new Error('Route system not initialized');
    }

    switch (action) {
      case 'add_route':
        const { type, start, end } = data;
        this.simulation.routeSystem.addRoute(type, start, end);
        break;
      default:
        throw new Error(`Unknown route action: ${action}`);
    }

    return {
      success: true,
      state: this.simulation.getState()
    };
  }

  handleControl(action, data) {
    try {
      switch (action) {
        case 'start':
          this.simulation.start();
          break;
        case 'stop':
          this.simulation.stop();
          break;
        case 'reset':
          this.simulation.reset();
          break;
        case 'virus_spawn':
        case 'virus_boost':
        case 'virus_suppress':
        case 'virus_param_update':
          return this.handleVirusControl(action, data);
        case 'add_route':
          return this.handleRouteControl(action, data);
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        success: true,
        state: this.simulation.getState()
      };
    } catch (error) {
      console.error('Error in control handler:', error);
      throw error;
    }
  }

  handleMarketData({ current, trends }) {
    if (!this.simulation?.virusSystem) return;

    try {
      // Translate market data to virus parameters
      const virusParams = this.marketTranslator.translate(current, trends);
      
      if (!virusParams) return;

      // Update virus system parameters
      this.simulation.virusSystem.params.spreadRadius = virusParams.spreadRadius;
      this.simulation.virusSystem.params.growthMultiplier = virusParams.growthMultiplier;
      this.simulation.virusSystem.params.intensity = virusParams.intensity;

      // Spawn new points if indicated by market data
      if (virusParams.shouldSpawnNew) {
        const coordinates = [
          Math.random() * 360 - 180,  // Longitude: -180 to 180
          Math.random() * 180 - 90    // Latitude: -90 to 90
        ];
        this.simulation.virusSystem.addPoint(coordinates, 'MARKET_TRIGGERED');
      }

      // Broadcast market data update to clients
      this.broadcast('market_update', {
        marketData: current,
        trends,
        virusParams,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error handling market data:', error);
    }
  }
}

export { RouteSystem, VirusSystem, SimulationController };
export default SimulationServer; 