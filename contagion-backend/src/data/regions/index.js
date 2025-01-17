import northAmerica from './north-america.js';
import europe from './europe.js';
// Import other regions as they are added
// import asia from './asia.js';
// import africa from './africa.js';
// import southAmerica from './south-america.js';
// import oceania from './oceania.js';

// Define region metadata
export const regions = {
    'north-america': {
        name: 'North America',
        countries: Object.keys(northAmerica).length,
        data: northAmerica
    },
    'europe': {
        name: 'Europe',
        countries: Object.keys(europe).length,
        data: europe
    }
    // Add other regions as they become available
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
        countries: region.countries
    }));
};

export default getAllPoints(); 