import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';

const csvFilePath = './contagion-backend/src/data/worldcities.csv';
const regionsDir = './contagion-backend/src/data/regions';

// Define regions and their countries
const regions = {
    'africa': [
        'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Algeria', 'Tunisia', 
        'Ghana', 'Ethiopia', 'Tanzania'
    ],
    'asia': [
        'China', 'Japan', 'India', 'South Korea', 'Singapore', 'Thailand', 'Vietnam', 
        'Indonesia', 'Malaysia', 'Philippines'
    ],
    'europe': [
        'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 
        'Poland', 'Sweden', 'Norway', 'Finland'
    ],
    'north-america': [
        'United States', 'Canada', 'Mexico', 'Cuba', 'Jamaica', 'Panama', 
        'Costa Rica', 'Guatemala', 'Honduras', 'Nicaragua'
    ],
    'oceania': [
        'Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Solomon Islands',
        'Vanuatu', 'New Caledonia', 'Samoa'
    ],
    'south-america': [
        'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Ecuador', 'Venezuela',
        'Bolivia', 'Paraguay', 'Uruguay'
    ]
};

// Read CSV file
fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading CSV file:', err);
        return;
    }

    // Parse CSV data
    Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const rows = results.data;
            const regionData = {};
            const populationStats = {};

            // Initialize region data and population stats
            Object.keys(regions).forEach(region => {
                regionData[region] = {};
                populationStats[region] = {
                    totalPopulation: 0,
                    urbanPopulation: 0,
                    cities: 0,
                    majorCities: 0, // Cities > 1M
                    populationByCountry: {}
                };
                regions[region].forEach(country => {
                    regionData[region][country] = {};
                    populationStats[region].populationByCountry[country] = 0;
                });
            });

            // Process each row
            rows.forEach(row => {
                const country = row.country;
                const state = row.admin_name || 'Main Region';
                const city = row.city;
                const lat = parseFloat(row.lat);
                const lng = parseFloat(row.lng);
                const population = parseInt(row.population) || 0;
                const properPopulation = parseInt(row.population_proper) || population;
                const isCapital = row.capital === 'primary';

                // Find which region this country belongs to
                for (const [region, countries] of Object.entries(regions)) {
                    if (countries.includes(country)) {
                        // Initialize country and state if they don't exist
                        if (!regionData[region][country]) {
                            regionData[region][country] = {};
                        }
                        if (!regionData[region][country][state]) {
                            regionData[region][country][state] = [];
                        }

                        // Add city data with enhanced population info
                        if (population > 100000) { // Include all significant cities
                            regionData[region][country][state].push({
                                lat,
                                lng,
                                city,
                                population,
                                properPopulation,
                                isCapital,
                                isMetro: population > properPopulation
                            });

                            // Update population statistics
                            populationStats[region].totalPopulation += population;
                            populationStats[region].cities++;
                            populationStats[region].populationByCountry[country] += population;
                            
                            if (population > 1000000) {
                                populationStats[region].majorCities++;
                                populationStats[region].urbanPopulation += population;
                            }
                        }
                    }
                }
            });

            // Write region data files
            Object.entries(regionData).forEach(([region, data]) => {
                const stats = populationStats[region];
                const fileContent = `
                    export const regionStats = ${JSON.stringify(stats, null, 2)};
                    export default ${JSON.stringify(data, null, 2)};
                `;
                
                const filePath = path.join(regionsDir, `${region}.js`);

                fs.writeFile(filePath, fileContent, (writeErr) => {
                    if (writeErr) {
                        console.error(`Error writing ${region}.js:`, writeErr);
                    } else {
                        console.log(`Successfully wrote ${region}.js with population stats`);
                    }
                });
            });

            // Update index.js with population stats
            const indexContent = `
                import northAmerica, { regionStats as northAmericaStats } from './north-america.js';
                import europe, { regionStats as europeStats } from './europe.js';
                import asia, { regionStats as asiaStats } from './asia.js';
                import africa, { regionStats as africaStats } from './africa.js';
                import southAmerica, { regionStats as southAmericaStats } from './south-america.js';
                import oceania, { regionStats as oceaniaStats } from './oceania.js';

                // Global population data from processed cities
                export const REGION_POPULATIONS = {
                    'asia': {
                        ...asiaStats,
                        populationDensity: 95,
                        urbanPopulationPercent: Math.floor((asiaStats.urbanPopulation / asiaStats.totalPopulation) * 100)
                    },
                    'africa': {
                        ...africaStats,
                        populationDensity: 45,
                        urbanPopulationPercent: Math.floor((africaStats.urbanPopulation / africaStats.totalPopulation) * 100)
                    },
                    // ... (similar for other regions)
                };

                // Define region metadata
                export const regions = {
                    'north-america': {
                        name: 'North America',
                        countries: Object.keys(northAmerica).length,
                        data: northAmerica,
                        stats: northAmericaStats,
                        bounds: {
                            north: 83.0,
                            south: 14.5,
                            west: -168.0,
                            east: -52.0
                        }
                    },
                    // ... (similar for other regions)
                };

                // ... (keep existing helper functions)
            `;

            fs.writeFile(path.join(regionsDir, 'index.js'), indexContent, (writeErr) => {
                if (writeErr) {
                    console.error('Error writing index.js:', writeErr);
                } else {
                    console.log('Successfully updated index.js with population stats');
                }
            });
        },
        error: (error) => {
            console.error('Error parsing CSV:', error);
        }
    });
});
