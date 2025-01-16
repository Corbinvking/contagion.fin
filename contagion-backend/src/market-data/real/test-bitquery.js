import { BitqueryService } from './BitqueryService.js';

async function testBitqueryService() {
    const service = new BitqueryService();
    
    try {
        console.log('Fetching token data...');
        const data = await service.fetchTokenData();
        console.log('Token Data:', JSON.stringify(data, null, 2));

        // Test caching
        console.log('\nTesting cache (should be instant)...');
        const cachedData = await service.fetchTokenData();
        console.log('Cached Data Retrieved');

        // Wait for cache to expire
        console.log('\nWaiting for cache to expire (5 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 5500));

        // Fetch fresh data
        console.log('Fetching fresh data...');
        const freshData = await service.fetchTokenData();
        console.log('Fresh Data:', JSON.stringify(freshData, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testBitqueryService(); 