import { MarketDataStream } from './MarketDataStream.js';
import { MarketToVirusTranslator } from './MarketToVirusTranslator.js';

async function testMarketToVirusTranslation() {
    // Create instances with debug mode
    const stream = new MarketDataStream({
        interval: 10000,  // 10 seconds
        windowSize: 3     // Keep last 3 data points
    });

    const translator = new MarketToVirusTranslator({
        debug: true,
        // Adjust thresholds for testing
        volumeChangeThreshold: 5,    // 5% change
        volatilityThreshold: 10,     // 10% change
        // More aggressive growth for testing
        baseGrowthMultiplier: 1.5,
        maxGrowthMultiplier: 3.0
    });

    // Listen for market data and translate to virus parameters
    stream.on('data', ({ current, trends }) => {
        console.log('\n=== New Market Data ===');
        console.log('Market Data:', JSON.stringify(current, null, 2));
        
        if (trends) {
            console.log('\nMarket Trends:', JSON.stringify(trends, null, 2));
            
            // Translate market data to virus parameters
            const virusParams = translator.translate(current, trends);
            console.log('\nVirus Parameters:', JSON.stringify(virusParams, null, 2));

            // If should spawn new points, show potential positions
            if (virusParams.shouldSpawnNew) {
                const newPosition = translator.getRandomSpawnPosition();
                console.log('\nSuggested New Spawn Position:', newPosition);
            }
        }
    });

    // Handle errors
    stream.on('error', (error) => {
        console.error('Stream error:', error.message);
    });

    // Start the stream
    console.log('Starting market data stream...');
    stream.start();

    // Run for 1 minute
    console.log('Running test for 1 minute...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    stream.stop();
    console.log('\nTest complete');
}

// Run the test
testMarketToVirusTranslation(); 