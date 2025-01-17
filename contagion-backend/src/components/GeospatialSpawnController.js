import defaultPoints, { 
    getRegionPoints, 
    getCountryPoints, 
    getRegionsInfo 
} from '../data/regions/index.js';
import { KDTree } from '../utils/KDTree.js';

class GeospatialSpawnController {
    constructor(predefinedPoints = defaultPoints) {
        this.points = predefinedPoints;
        this.kdTrees = new Map();  // One KD-tree per region
        this.debugMode = true;
        this.activeRegions = new Set();
        this.loadedRegions = new Map();
        this.populationCache = new Map();
        
        // Initialize with all available points
        this.initializePoints();
    }

    async initializePoints() {
        try {
            const regions = getRegionsInfo();
            
            if (this.debugMode) {
                console.log('Available regions:', regions);
            }

            // Load all regions by default
            regions.forEach(region => {
                const regionData = getRegionPoints(region.key);
                if (regionData) {
                    this.loadedRegions.set(region.key, regionData);
                    this.activeRegions.add(region.key);
                    this.initializeKDTreeForRegion(region.key, regionData);
                }
            });

            if (this.debugMode) {
                console.log('GeospatialSpawnController initialized with:', {
                    regions: this.activeRegions.size,
                    totalPoints: this.getTotalPoints()
                });
            }
        } catch (error) {
            console.error('Error initializing points:', error);
            throw error;
        }
    }

    initializeKDTreeForRegion(regionKey, regionData) {
        const points = [];
        Object.entries(regionData).forEach(([country, states]) => {
            Object.entries(states).forEach(([state, cities]) => {
                cities.forEach(city => {
                    points.push({
                        ...city,
                        country,
                        state
                    });
                });
            });
        });
        this.kdTrees.set(regionKey, new KDTree(points));
    }

    loadRegion(regionKey) {
        if (this.activeRegions.has(regionKey)) return;

        const regionData = getRegionPoints(regionKey);
        if (regionData) {
            this.loadedRegions.set(regionKey, regionData);
            this.activeRegions.add(regionKey);
            this.initializeKDTreeForRegion(regionKey, regionData);

            if (this.debugMode) {
                console.log(`Loaded region: ${regionKey}`);
            }
        }
    }

    unloadRegion(regionKey) {
        if (this.loadedRegions.delete(regionKey)) {
            this.activeRegions.delete(regionKey);
            this.kdTrees.delete(regionKey);
            this.populationCache.clear();

            if (this.debugMode) {
                console.log(`Unloaded region: ${regionKey}`);
            }
        }
    }

    findNearestPoint(currentPosition, options = {}) {
        if (!this.validatePosition(currentPosition)) {
            throw new Error('Invalid position format');
        }

        const { 
            preferHighPopulation = true,
            minPopulation = 0,
            maxDistance = 1000 // km
        } = options;

        // Find the region for the current position
        const regionKey = this.findRegionForPosition(currentPosition);
        if (!regionKey || !this.kdTrees.has(regionKey)) {
            if (this.debugMode) {
                console.warn('No valid region found for position:', currentPosition);
            }
            return null;
        }

        // Get k nearest neighbors
        const kdTree = this.kdTrees.get(regionKey);
        const neighbors = kdTree.findKNearestNeighbors(currentPosition, 5);

        // Filter and sort by criteria
        const validNeighbors = neighbors
            .filter(point => {
                const distance = this.calculateDistance(
                    currentPosition[0], currentPosition[1],
                    point.lat, point.lng
                );
                return distance <= maxDistance && point.population >= minPopulation;
            })
            .sort((a, b) => {
                if (preferHighPopulation) {
                    return b.population - a.population;
                }
                return 0; // Random selection among valid points
            });

        return validNeighbors.length > 0 ? validNeighbors[0] : null;
    }

    findRegionForPosition(position) {
        for (const [regionKey, region] of Object.entries(this.loadedRegions)) {
            const bounds = region.bounds;
            if (position[0] >= bounds.south && position[0] <= bounds.north &&
                position[1] >= bounds.west && position[1] <= bounds.east) {
                return regionKey;
            }
        }
        return null;
    }

    getNextSpawnPosition(currentPosition, pattern = 'NORMAL') {
        if (!this.validatePosition(currentPosition)) {
            throw new Error('Invalid current position');
        }

        // Adjust search options based on pattern
        const options = {
            preferHighPopulation: pattern === 'BURST',
            minPopulation: pattern === 'VECTOR' ? 500000 : 0,
            maxDistance: pattern === 'NORMAL' ? 500 : 1000
        };

        const nearestPoint = this.findNearestPoint(currentPosition, options);
        
        if (!nearestPoint) {
            if (this.debugMode) {
                console.warn('No valid spawn points found near:', currentPosition);
            }
            return null;
        }

        // Cache population data for the point
        const key = `${nearestPoint.lat},${nearestPoint.lng}`;
        this.populationCache.set(key, {
            population: nearestPoint.population,
            country: nearestPoint.country,
            state: nearestPoint.state,
            city: nearestPoint.city
        });

        return [nearestPoint.lat, nearestPoint.lng];
    }

    getPopulationData(lat, lng) {
        const key = `${lat},${lng}`;
        return this.populationCache.get(key);
    }

    getTotalPoints() {
        let total = 0;
        this.loadedRegions.forEach(region => {
            Object.values(region).forEach(country => {
                Object.values(country).forEach(state => {
                    total += state.length;
                });
            });
        });
        return total;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const toRadians = (deg) => (deg * Math.PI) / 180;

        const R = 6371; // Earth radius in km
        const dLat = toRadians(lat2 - lat1);
        const dLng = toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in km
    }

    updatePoints(newPoints, regionKey = null) {
        if (regionKey) {
            // Update specific region
            this.loadedRegions.set(regionKey, newPoints);
            this.activeRegions.add(regionKey);
        } else {
            // Update all points
            this.points = newPoints;
            this.loadedRegions.clear();
            this.activeRegions.clear();
            // Initialize with new points
            this.initializePoints();
        }

        this.initializeKDTree();
        
        if (this.debugMode) {
            console.log('Updated points:', {
                regions: this.activeRegions.size,
                totalPoints: this.flatPoints.length
            });
        }
    }

    validatePosition(position) {
        if (!position || !Array.isArray(position) || position.length !== 2) {
            return false;
        }
        const [lat, lng] = position;
        return (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
        );
    }

    // Add method to get active regions info
    getActiveRegionsInfo() {
        return {
            activeRegions: Array.from(this.activeRegions),
            pointsPerRegion: Array.from(this.loadedRegions.entries()).map(([key, data]) => ({
                region: key,
                countries: Object.keys(data).length,
                points: Object.values(data).reduce((acc, country) => 
                    acc + Object.values(country).reduce((sum, region) => 
                        sum + region.length, 0), 0)
            }))
        };
    }
}

export default GeospatialSpawnController; 