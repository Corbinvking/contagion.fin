import { MarketDataStream } from './MarketDataStream.js';

async function testMarketDataStream() {
    // Create stream with 10-second interval and 3 data points window
    const stream = new MarketDataStream({
        interval: 10000,  // 10 seconds
        windowSize: 3     // Keep last 3 data points
    });

    // Listen for events
    stream.on('stream:start', () => {
        console.log('Stream started');
    });

    stream.on('stream:stop', () => {
        console.log('Stream stopped');
    });

    stream.on('data', ({ current, trends }) => {
        console.log('\n--- New Data Point ---');
        console.log('Current Data:', JSON.stringify(current, null, 2));
        
        if (trends) {
            console.log('\nTrends:', JSON.stringify(trends, null, 2));
        }

        // Show window status
        console.log('\nWindow Status:', JSON.stringify(stream.getStatus(), null, 2));
    });

    stream.on('error', (error) => {
        console.error('Stream error:', error.message);
    });

    // Start the stream
    stream.start();

    // Run for 1 minute then stop
    console.log('Running stream for 1 minute...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    stream.stop();
    console.log('Test complete');
}

// Run the test
testMarketDataStream(); 