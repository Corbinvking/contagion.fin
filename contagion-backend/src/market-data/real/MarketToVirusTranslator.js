export class MarketToVirusTranslator {
    constructor() {
        this.params = {
            baseRadius: 0.5,
            minMultiplier: 0.1,
            maxMultiplier: 5.0,
            volatilityThreshold: 10.0,
            volumeThreshold: 1000000, // $1M threshold
            priceChangeThreshold: 5.0 // 5% threshold
        };
    }

    translateMarketData(marketData) {
        const { current, trends } = marketData;
        const metrics = current.marketMetrics;

        // Initialize virus parameters
        const virusParams = {
            spreadRadius: this.params.baseRadius,
            growthMultiplier: 1.0,
            shouldSpawnNew: false,
            spawnReason: null,
            pattern: 'NORMAL'
        };

        // Adjust spread radius based on volume
        const volumeInMillions = parseFloat(metrics.volume) / 1000000;
        virusParams.spreadRadius = Math.max(
            this.params.baseRadius * (1 + (volumeInMillions / 10)),
            this.params.minMultiplier
        );

        // Adjust growth multiplier based on volatility
        const volatility = parseFloat(metrics.volatility);
        virusParams.growthMultiplier = Math.min(
            1 + (volatility / 100),
            this.params.maxMultiplier
        );

        // Check conditions for spawning new spores
        if (trends) {
            const priceChange = parseFloat(trends.priceChange);
            const volumeChange = parseFloat(trends.volumeChange);

            // Spawn on significant price increase
            if (priceChange > this.params.priceChangeThreshold) {
                virusParams.shouldSpawnNew = true;
                virusParams.spawnReason = 'PRICE_SURGE';
                virusParams.pattern = 'BURST';
            }
            // Spawn on high volume
            else if (volumeChange > this.params.volumeThreshold) {
                virusParams.shouldSpawnNew = true;
                virusParams.spawnReason = 'HIGH_VOLUME';
                virusParams.pattern = 'VECTOR';
            }
            // Spawn on high volatility
            else if (volatility > this.params.volatilityThreshold) {
                virusParams.shouldSpawnNew = true;
                virusParams.spawnReason = 'HIGH_VOLATILITY';
                virusParams.pattern = 'BURST';
            }
        }

        return virusParams;
    }

    getRandomCoordinates() {
        return [
            Math.random() * 180 - 90,  // Latitude: -90 to 90
            Math.random() * 360 - 180  // Longitude: -180 to 180
        ];
    }
} 