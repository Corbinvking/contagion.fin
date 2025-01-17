import { KDTree } from '../utils/KDTree.js';
import GeospatialSpawnController from './GeospatialSpawnController.js';

class GeoSpreadSystem {
    constructor() {
        this.spawnController = new GeospatialSpawnController();
        this.infectedCities = new Map(); // city -> infection level (0-1)
        this.transmissionRoutes = new Map(); // city -> Set of connected cities
        this.activeHotspots = new Set();
        this.spreadMetrics = {
            totalInfected: 0,
            infectedByRegion: new Map(),
            transmissionHistory: [],
            hotspotCount: 0
        };

        // Transmission factors
        this.spreadFactors = {
            population: 0.4,    // Higher population = faster spread
            distance: 0.6,      // Closer cities = higher transmission
            connectivity: 0.3,  // More connections = faster spread
            urbanization: 0.5   // Urban areas spread faster
        };
    }

    initializeSpread(startingPoint, pattern = 'NORMAL') {
        const startCity = this.spawnController.findNearestPoint(startingPoint, {
            preferHighPopulation: true,
            minPopulation: 100000
        });

        if (!startCity) {
            console.warn('No valid starting city found near:', startingPoint);
            return null;
        }

        // Initialize infection at starting city
        this.infectedCities.set(startCity.city, {
            level: 1.0,
            timestamp: Date.now(),
            pattern,
            population: startCity.population
        });

        // Set up initial transmission routes
        this.updateTransmissionRoutes(startCity);

        return startCity;
    }

    updateTransmissionRoutes(sourceCity) {
        const nearbyPoints = this.spawnController.kdTrees.get(this.findRegionKey(sourceCity))
            .findKNearestNeighbors(sourceCity, 5);

        const routes = new Set();
        nearbyPoints.forEach(point => {
            if (point.city !== sourceCity.city) {
                routes.add(point);
                // Bi-directional connection
                if (!this.transmissionRoutes.has(point.city)) {
                    this.transmissionRoutes.set(point.city, new Set());
                }
                this.transmissionRoutes.get(point.city).add(sourceCity);
            }
        });

        this.transmissionRoutes.set(sourceCity.city, routes);
    }

    update(deltaTime) {
        // Process each infected city
        for (const [cityName, infection] of this.infectedCities) {
            this.processTransmission(cityName, infection, deltaTime);
        }

        // Update metrics
        this.updateSpreadMetrics();
    }

    processTransmission(sourceCityName, infection, deltaTime) {
        const sourceCity = this.getCityData(sourceCityName);
        if (!sourceCity) return;

        const connectedCities = this.transmissionRoutes.get(sourceCityName) || new Set();
        
        for (const targetCity of connectedCities) {
            if (this.infectedCities.has(targetCity.city)) continue;

            const transmissionProb = this.calculateTransmissionProbability(
                sourceCity,
                targetCity,
                infection.pattern
            );

            // Attempt transmission based on probability
            if (Math.random() < transmissionProb * (deltaTime / 1000)) {
                this.infectedCities.set(targetCity.city, {
                    level: 0.1, // Initial infection level
                    timestamp: Date.now(),
                    pattern: infection.pattern,
                    population: targetCity.population
                });

                // Update routes for newly infected city
                this.updateTransmissionRoutes(targetCity);
            }
        }
    }

    calculateTransmissionProbability(sourceCity, targetCity, pattern) {
        // Population-based transmission
        const popFactor = Math.log10(targetCity.population) / Math.log10(10000000);
        
        // Distance-based decay
        const distance = this.spawnController.calculateDistance(
            sourceCity.lat, sourceCity.lng,
            targetCity.lat, targetCity.lng
        );
        const distanceFactor = Math.exp(-distance / 1000);
        
        // Urban factor
        const urbanFactor = targetCity.isMetro ? 1.2 : 1.0;
        
        // Pattern adjustments
        const patternMultiplier = {
            'BURST': 1.5,
            'VECTOR': 1.2,
            'NORMAL': 1.0
        }[pattern] || 1.0;

        return Math.min(
            (popFactor * this.spreadFactors.population +
            distanceFactor * this.spreadFactors.distance +
            urbanFactor * this.spreadFactors.urbanization) * patternMultiplier,
            1.0
        );
    }

    updateSpreadMetrics() {
        let totalInfected = 0;
        const infectedByRegion = new Map();

        for (const [cityName, infection] of this.infectedCities) {
            const cityData = this.getCityData(cityName);
            if (!cityData) continue;

            const regionKey = this.findRegionKey(cityData);
            const infectedPop = Math.floor(cityData.population * infection.level);
            
            totalInfected += infectedPop;
            infectedByRegion.set(
                regionKey,
                (infectedByRegion.get(regionKey) || 0) + infectedPop
            );
        }

        this.spreadMetrics = {
            ...this.spreadMetrics,
            totalInfected,
            infectedByRegion,
            hotspotCount: this.activeHotspots.size
        };
    }

    getCityData(cityName) {
        // Search through all regions to find city data
        for (const [regionKey, kdTree] of this.spawnController.kdTrees) {
            const points = kdTree.root ? this.flattenTree(kdTree.root) : [];
            const city = points.find(p => p.city === cityName);
            if (city) return city;
        }
        return null;
    }

    findRegionKey(cityData) {
        for (const [regionKey, region] of this.spawnController.loadedRegions) {
            const bounds = region.bounds;
            if (cityData.lat >= bounds.south && cityData.lat <= bounds.north &&
                cityData.lng >= bounds.west && cityData.lng <= bounds.east) {
                return regionKey;
            }
        }
        return null;
    }

    flattenTree(node, points = []) {
        if (!node) return points;
        points.push(node.point);
        this.flattenTree(node.left, points);
        this.flattenTree(node.right, points);
        return points;
    }

    getSpreadMetrics() {
        return {
            ...this.spreadMetrics,
            infectedCities: Array.from(this.infectedCities.entries()).map(([city, data]) => ({
                city,
                ...data
            }))
        };
    }
}

export default GeoSpreadSystem; 