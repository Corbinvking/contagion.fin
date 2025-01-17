
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
                    'europe': {
                        ...europeStats,
                        populationDensity: 73,
                        urbanPopulationPercent: Math.floor((europeStats.urbanPopulation / europeStats.totalPopulation) * 100)
                    },
                    'north-america': {
                        ...northAmericaStats,
                        populationDensity: 25,
                        urbanPopulationPercent: Math.floor((northAmericaStats.urbanPopulation / northAmericaStats.totalPopulation) * 100)
                    },
                    'oceania': {
                        ...oceaniaStats,
                        populationDensity: 5,
                        urbanPopulationPercent: Math.floor((oceaniaStats.urbanPopulation / oceaniaStats.totalPopulation) * 100)
                    },
                    'south-america': {
                        ...southAmericaStats,
                        populationDensity: 25,
                        urbanPopulationPercent: Math.floor((southAmericaStats.urbanPopulation / southAmericaStats.totalPopulation) * 100)
                    }
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
                    'europe': {
                        name: 'Europe',
                        countries: Object.keys(europe).length,
                        data: europe,
                        stats: europeStats,
                        bounds: {
                            north: 71.0,
                            south: 35.0,
                            west: -10.0,
                            east: 40.0
                        }
                    },
                    'asia': {
                        name: 'Asia',
                        countries: Object.keys(asia).length,
                        data: asia,
                        stats: asiaStats,
                        bounds: {
                            north: 53.0,
                            south: -10.0,
                            west: 25.0,
                            east: 145.0
                        }
                    },
                    'africa': {
                        name: 'Africa',
                        countries: Object.keys(africa).length,
                        data: africa,
                        stats: africaStats,
                        bounds: {
                            north: 37.0,
                            south: -35.0,
                            west: -17.0,
                            east: 51.0
                        }
                    },
                    'oceania': {
                        name: 'Oceania',
                        countries: Object.keys(oceania).length,
                        data: oceania,
                        stats: oceaniaStats,
                        bounds: {
                            north: -0.0,
                            south: -47.0,
                            west: 110.0,
                            east: 180.0
                        }
                    },
                    'south-america': {
                        name: 'South America',
                        countries: Object.keys(southAmerica).length,
                        data: southAmerica,
                        stats: southAmericaStats,
                        bounds: {
                            north: 12.0,
                            south: -55.0,
                            west: -81.0,
                            east: -35.0
                        }
                    }
                };

                // ... (keep existing helper functions)
            