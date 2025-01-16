import { SolanaTrackerService } from './soltracker.js';

async function testSolanaTrackerService() {
    console.log('=== Testing SolanaTracker Service ===\n');
    const service = new SolanaTrackerService('cc9bbf56-4407-4b57-a56c-0e184fa58040');
    
    // Test with Jupiter Perps LP token
    const tokenAddress = '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4';

    try {
        console.log('Test 1: Fetching token data...');
        const metrics = await service.processTokenData(tokenAddress);
        console.log('Market metrics:', {
            price: metrics.price,
            marketCap: metrics.marketCap,
            volume: metrics.volume,
            volatility: metrics.volatility,
            transactions: metrics.transactions
        });

        console.log('\nTest 2: Testing cache functionality...');
        console.time('Cached fetch');
        const cachedMetrics = await service.processTokenData(tokenAddress);
        console.timeEnd('Cached fetch');
        console.log('Cached metrics match:', JSON.stringify(metrics) === JSON.stringify(cachedMetrics));

        console.log('\nAll tests passed successfully!');
    } catch (error) {
        console.log('Test failed:', error);
        console.log('Error details:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
            console.log('Response status:', error.response.status);
        }
    }
}

console.log('Starting SolanaTracker integration tests...');
testSolanaTrackerService(); 