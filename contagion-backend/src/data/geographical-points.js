// Geographical points for virus spread simulation
// Format: Country -> Region/State -> Array of lat/lng points

const geographicalPoints = {
    "USA": {
        "California": [
            {"lat": 34.0522, "lng": -118.2437}, // Los Angeles
            {"lat": 36.7783, "lng": -119.4179}, // Fresno
            {"lat": 37.7749, "lng": -122.4194}, // San Francisco
            {"lat": 38.5816, "lng": -121.4944}  // Sacramento
        ],
        "New York": [
            {"lat": 40.7128, "lng": -74.0060},  // New York City
            {"lat": 42.6526, "lng": -73.7562},  // Albany
            {"lat": 42.8864, "lng": -78.8784},  // Buffalo
            {"lat": 43.0481, "lng": -76.1474}   // Syracuse
        ]
    },
    "Canada": {
        "Ontario": [
            {"lat": 43.65107, "lng": -79.347015}, // Toronto
            {"lat": 45.4215, "lng": -75.6972},    // Ottawa
            {"lat": 42.9849, "lng": -81.2453},    // London
            {"lat": 43.2557, "lng": -79.8711}     // Hamilton
        ],
        "Quebec": [
            {"lat": 45.5017, "lng": -73.5673},    // Montreal
            {"lat": 46.8139, "lng": -71.2080},    // Quebec City
            {"lat": 45.4040, "lng": -71.8929},    // Sherbrooke
            {"lat": 48.4279, "lng": -71.0485}     // Saguenay
        ]
    }
    // Add more countries and regions as needed
};

// Helper function to validate the data structure
const validateGeographicalPoints = (points) => {
    if (typeof points !== 'object') return false;

    for (const country in points) {
        if (typeof points[country] !== 'object') return false;
        
        for (const region in points[country]) {
            if (!Array.isArray(points[country][region])) return false;
            
            for (const point of points[country][region]) {
                if (!point.lat || !point.lng) return false;
                if (point.lat < -90 || point.lat > 90) return false;
                if (point.lng < -180 || point.lng > 180) return false;
            }
        }
    }
    return true;
};

// Helper function to get total points count
const getTotalPointsCount = (points) => {
    let total = 0;
    Object.values(points).forEach(country => {
        Object.values(country).forEach(region => {
            total += region.length;
        });
    });
    return total;
};

// Export the data and helper functions
export {
    geographicalPoints as default,
    validateGeographicalPoints,
    getTotalPointsCount
}; 