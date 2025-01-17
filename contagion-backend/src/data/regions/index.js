import northAmerica from './north-america.js';
import europe from './europe.js';
import asia from './asia.js';
import africa from './africa.js';
import southAmerica from './south-america.js';
import oceania from './oceania.js';

// Global population data (2024 estimates)
const GLOBAL_POPULATION = 8_200_000_000;
const REGION_POPULATIONS = {
    'asia': {
        population: 4_700_000_000,           // ~57.3% of global
        populationDensity: 95,               // people per km²
        urbanPopulationPercent: 51,          // % living in urban areas
        majorCitiesPercent: 35               // % living in major cities
    },
    'africa': {
        population: 1_400_000_000,           // ~17.1% of global
        populationDensity: 45,
        urbanPopulationPercent: 43,
        majorCitiesPercent: 30
    },
    'europe': {
        population: 750_000_000,             // ~9.1% of global
        populationDensity: 73,
        urbanPopulationPercent: 75,
        majorCitiesPercent: 55
    },
    'north-america': {
        population: 600_000_000,             // ~7.3% of global
        populationDensity: 25,
        urbanPopulationPercent: 82,
        majorCitiesPercent: 45
    },
    'south-america': {
        population: 430_000_000,             // ~5.2% of global
        populationDensity: 24,
        urbanPopulationPercent: 81,
        majorCitiesPercent: 40
    },
    'oceania': {
        population: 44_000_000,              // ~0.5% of global
        populationDensity: 5,
        urbanPopulationPercent: 68,
        majorCitiesPercent: 50
    }
};

// Define region metadata
export const regions = {
    'north-america': {
        name: 'North America',
        countries: Object.keys(northAmerica).length,
        data: northAmerica,
        population: REGION_POPULATIONS['north-america'],
        bounds: {
            north: 83.0,   // Northern Canada
            south: 14.5,   // Southern Mexico
            west: -168.0,  // Alaska
            east: -52.0    // Eastern Canada
        }
    },
    'europe': {
        name: 'Europe',
        countries: Object.keys(europe).length,
        data: europe,
        bounds: {
            north: 71.0,   // Northern Scandinavia
            south: 35.0,   // Southern Mediterranean
            west: -10.0,   // Western Ireland
            east: 40.0     // Eastern Europe
        }
    },
    'asia': {
        name: 'Asia',
        countries: Object.keys(asia).length,
        data: asia,
        bounds: {
            north: 53.0,   // Northern China/Russia
            south: -8.0,   // Indonesia
            west: 26.0,    // Western Middle East
            east: 145.0    // Japan
        }
    },
    'africa': {
        name: 'Africa',
        countries: Object.keys(africa).length,
        data: africa,
        bounds: {
            north: 37.0,   // Northern Mediterranean Coast
            south: -35.0,  // South Africa
            west: -17.0,   // Western Coast
            east: 51.0     // Eastern Coast
        }
    },
    'south-america': {
        name: 'South America',
        countries: Object.keys(southAmerica).length,
        data: southAmerica,
        bounds: {
            north: 12.0,   // Northern Colombia
            south: -55.0,  // Southern Chile/Argentina
            west: -81.0,   // Western Coast
            east: -35.0    // Eastern Brazil
        }
    },
    'oceania': {
        name: 'Oceania',
        countries: Object.keys(oceania).length,
        data: oceania,
        bounds: {
            north: -5.0,   // Papua New Guinea
            south: -47.0,  // Southern New Zealand
            west: 110.0,   // Western Australia
            east: -180.0   // Pacific Islands
        }
    }
};

// Helper function to get points for specific region
export const getRegionPoints = (regionKey) => {
    return regions[regionKey]?.data || null;
};

// Helper function to get all available points
export const getAllPoints = () => {
    const allPoints = {};
    Object.values(regions).forEach(region => {
        Object.assign(allPoints, region.data);
    });
    return allPoints;
};

// Helper function to get points for specific countries
export const getCountryPoints = (countryNames) => {
    const countryPoints = {};
    Object.values(regions).forEach(region => {
        Object.entries(region.data).forEach(([country, data]) => {
            if (countryNames.includes(country)) {
                countryPoints[country] = data;
            }
        });
    });
    return countryPoints;
};

// Helper function to get available regions info
export const getRegionsInfo = () => {
    return Object.entries(regions).map(([key, region]) => ({
        key,
        name: region.name,
        countries: region.countries,
        bounds: region.bounds
    }));
};

// Helper function to find region for coordinates
export const findRegionForCoordinates = (lat, lng) => {
    return Object.entries(regions).find(([_, region]) => {
        const { bounds } = region;
        return (
            lat <= bounds.north &&
            lat >= bounds.south &&
            lng >= bounds.west &&
            lng <= bounds.east
        );
    })?.[0] || null;
};

// Helper function to get points within distance
export const getPointsWithinDistance = (lat, lng, distanceKm) => {
    const points = [];
    Object.values(regions).forEach(region => {
        Object.entries(region.data).forEach(([country, states]) => {
            Object.entries(states).forEach(([state, locations]) => {
                locations.forEach(point => {
                    const distance = calculateDistance(lat, lng, point.lat, point.lng);
                    if (distance <= distanceKm) {
                        points.push({
                            ...point,
                            country,
                            state,
                            distance
                        });
                    }
                });
            });
        });
    });
    return points.sort((a, b) => a.distance - b.distance);
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

// Population tracking helpers
export const calculateInfectedPopulation = (infectedPoints, regionKey = null) => {
    const calculateForRegion = (region, points) => {
        const regionData = REGION_POPULATIONS[region];
        const totalPointsInRegion = getTotalPointsInRegion(region);
        const infectedPointsInRegion = points.filter(p => isPointInRegion(p, regions[region].bounds)).length;
        
        // Calculate infection percentage based on infected points vs total points
        const infectionCoverage = infectedPointsInRegion / totalPointsInRegion;
        
        // Weight the infection by urban population since points are mainly cities
        const effectivePopulation = regionData.population * (regionData.urbanPopulationPercent / 100);
        
        return Math.floor(effectivePopulation * infectionCoverage);
    };

    if (regionKey) {
        return calculateForRegion(regionKey, infectedPoints);
    }

    // Calculate global infection if no region specified
    return Object.keys(REGION_POPULATIONS).reduce((total, region) => {
        return total + calculateForRegion(region, infectedPoints);
    }, 0);
};

// Get total points in a region
const getTotalPointsInRegion = (regionKey) => {
    let total = 0;
    const regionData = regions[regionKey].data;
    Object.values(regionData).forEach(country => {
        Object.values(country).forEach(state => {
            total += state.length;
        });
    });
    return total;
};

// Check if a point is within region bounds
const isPointInRegion = (point, bounds) => {
    return (
        point.lat <= bounds.north &&
        point.lat >= bounds.south &&
        point.lng >= bounds.west &&
        point.lng <= bounds.east
    );
};

// Get population density at a point
export const getPopulationDensityAtPoint = (lat, lng) => {
    const regionKey = findRegionForCoordinates(lat, lng);
    if (!regionKey) return 0;

    const region = REGION_POPULATIONS[regionKey];
    const nearbyPoints = getPointsWithinDistance(lat, lng, 100); // 100km radius
    
    // Adjust base density by nearby urban centers
    const urbanFactor = nearbyPoints.length * (region.urbanPopulationPercent / 100);
    return Math.floor(region.populationDensity * (1 + urbanFactor));
};

// Get estimated population affected by a point
export const getPopulationAffectedByPoint = (point, radius) => {
    const regionKey = findRegionForCoordinates(point.lat, point.lng);
    if (!regionKey) return 0;

    const region = REGION_POPULATIONS[regionKey];
    const areaSqKm = Math.PI * radius * radius;
    const basePop = areaSqKm * region.populationDensity;
    
    // Adjust for urban/rural based on nearby points
    const nearbyPoints = getPointsWithinDistance(point.lat, point.lng, radius);
    const urbanFactor = nearbyPoints.length > 0 ? 
        region.urbanPopulationPercent / 100 : 
        (100 - region.urbanPopulationPercent) / 100;

    return Math.floor(basePop * urbanFactor);
};

// Get region statistics
export const getRegionStatistics = (regionKey) => {
    const region = regions[regionKey];
    const population = REGION_POPULATIONS[regionKey];
    
    return {
        name: region.name,
        totalPopulation: population.population,
        populationDensity: population.populationDensity,
        urbanPopulation: Math.floor(population.population * (population.urbanPopulationPercent / 100)),
        majorCitiesPopulation: Math.floor(population.population * (population.majorCitiesPercent / 100)),
        totalPoints: getTotalPointsInRegion(regionKey),
        averagePopulationPerPoint: Math.floor(population.population / getTotalPointsInRegion(regionKey))
    };
};

export default getAllPoints(); 