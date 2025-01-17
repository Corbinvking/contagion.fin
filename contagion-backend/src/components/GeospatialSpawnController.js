import defaultPoints, { 
    getRegionPoints, 
    getCountryPoints, 
    getRegionsInfo 
} from '../data/regions/index.js';

class GeospatialSpawnController {
    constructor(predefinedPoints = defaultPoints) {
        this.points = predefinedPoints;
        this.kdTree = null;
        this.debugMode = true;
        this.activeRegions = new Set();
        this.loadedRegions = new Map();
        
        // Initialize with all available points
        this.initializePoints();
    }

    async initializePoints() {
        try {
            // Get info about available regions
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
                }
            });

            // Initialize KD-tree with all loaded points
            this.initializeKDTree();

            if (this.debugMode) {
                console.log('GeospatialSpawnController initialized with:', {
                    regions: this.activeRegions.size,
                    totalPoints: this.flatPoints.length
                });
            }
        } catch (error) {
            console.error('Error initializing points:', error);
            throw error;
        }
    }

    // Add method to load specific regions
    loadRegion(regionKey) {
        if (this.activeRegions.has(regionKey)) {
            return; // Region already loaded
        }

        const regionData = getRegionPoints(regionKey);
        if (regionData) {
            this.loadedRegions.set(regionKey, regionData);
            this.activeRegions.add(regionKey);
            this.initializeKDTree(); // Reinitialize with new points

            if (this.debugMode) {
                console.log(`Loaded region: ${regionKey}`);
            }
        }
    }

    // Add method to unload specific regions
    unloadRegion(regionKey) {
        if (this.loadedRegions.delete(regionKey)) {
            this.activeRegions.delete(regionKey);
            this.initializeKDTree(); // Reinitialize without unloaded points

            if (this.debugMode) {
                console.log(`Unloaded region: ${regionKey}`);
            }
        }
    }

    initializeKDTree() {
        // Flatten points from all loaded regions
        const flatPoints = [];
        this.loadedRegions.forEach(regionData => {
            Object.values(regionData).forEach(country => {
                Object.values(country).forEach(region => {
                    region.forEach(point => {
                        flatPoints.push({
                            lat: point.lat,
                            lng: point.lng,
                            coordinates: [point.lat, point.lng]
                        });
                    });
                });
            });
        });
        
        this.flatPoints = flatPoints;
        
        if (this.debugMode) {
            console.log('KD-tree initialized with points:', flatPoints.length);
        }
    }

    findNearestPoint(currentPosition) {
        if (!currentPosition || !Array.isArray(currentPosition) || currentPosition.length !== 2) {
            throw new Error('Invalid position format');
        }

        const [currLat, currLng] = currentPosition;
        let nearest = null;
        let minDistance = Infinity;

        // Simple nearest neighbor search (will be replaced with KD-tree)
        this.flatPoints.forEach(point => {
            const distance = this.calculateDistance(
                currLat,
                currLng,
                point.lat,
                point.lng
            );

            if (distance < minDistance) {
                nearest = point;
                minDistance = distance;
            }
        });

        return nearest ? nearest.coordinates : null;
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

    getNextSpawnPosition(currentPosition, pattern = 'NORMAL') {
        if (!this.validatePosition(currentPosition)) {
            throw new Error('Invalid current position');
        }

        const nearestPoint = this.findNearestPoint(currentPosition);
        
        if (!nearestPoint) {
            if (this.debugMode) {
                console.warn('No valid spawn points found near:', currentPosition);
            }
            return null;
        }

        return nearestPoint;
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