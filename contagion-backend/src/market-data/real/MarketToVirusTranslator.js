export class MarketToVirusTranslator {
    constructor(options = {}) {
        // Base parameters for virus behavior
        this.params = {
            // Spread radius parameters
            baseRadius: options.baseRadius || 50,
            minRadius: options.minRadius || 10,
            maxRadius: options.maxRadius || 200,
            
            // Growth multiplier parameters
            baseGrowthMultiplier: options.baseGrowthMultiplier || 1.0,
            minGrowthMultiplier: options.minGrowthMultiplier || 0.5,
            maxGrowthMultiplier: options.maxGrowthMultiplier || 2.0,
            
            // Intensity parameters
            baseIntensity: options.baseIntensity || 0.5,
            minIntensity: options.minIntensity || 0.1,
            maxIntensity: options.maxIntensity || 1.0,
            
            // Thresholds for spawning new points
            volumeChangeThreshold: options.volumeChangeThreshold || 10, // 10% change
            volatilityThreshold: options.volatilityThreshold || 15,    // 15% change
            
            // Debug mode
            debug: options.debug || false
        };
    }

    translate(marketData, trends) {
        if (!marketData || !trends) {
            return null;
        }

        const virusParams = {
            // Base spread radius affected by volume changes
            spreadRadius: this.calculateSpreadRadius(trends.volumeChange),
            
            // Growth multiplier affected by volatility
            growthMultiplier: this.calculateGrowthMultiplier(marketData.volatility, trends.volatilityChange),
            
            // Intensity affected by transaction count
            intensity: this.calculateIntensity(trends.transactionCountChange),
            
            // Should spawn new points based on significant changes
            shouldSpawnNew: this.shouldSpawnNewPoints(trends),
            
            // Timestamp for tracking
            timestamp: marketData.fetchTimestamp
        };

        if (this.params.debug) {
            console.log('Market to Virus Translation:', {
                marketData: {
                    volatility: marketData.volatility,
                    totalVolume: marketData.totalVolume,
                    transactionCount: marketData.transactionCount
                },
                trends,
                virusParams
            });
        }

        return virusParams;
    }

    calculateSpreadRadius(volumeChange) {
        // Adjust spread radius based on volume changes
        const changeImpact = Math.min(Math.max(volumeChange, -50), 50) / 100; // Limit to ±50%
        const radiusAdjustment = this.params.baseRadius * (1 + changeImpact);
        
        return Math.min(
            Math.max(radiusAdjustment, this.params.minRadius),
            this.params.maxRadius
        );
    }

    calculateGrowthMultiplier(currentVolatility, volatilityChange) {
        // Higher volatility = faster growth
        const volatilityImpact = Math.min(Math.abs(currentVolatility) / 100, 1);
        const changeImpact = Math.min(Math.abs(volatilityChange) / 100, 1);
        
        const multiplier = this.params.baseGrowthMultiplier * 
            (1 + (volatilityImpact * 0.5) + (changeImpact * 0.5));
        
        return Math.min(
            Math.max(multiplier, this.params.minGrowthMultiplier),
            this.params.maxGrowthMultiplier
        );
    }

    calculateIntensity(transactionCountChange) {
        // Transaction count changes affect intensity
        const changeImpact = Math.min(Math.max(transactionCountChange, -50), 50) / 100;
        const intensity = this.params.baseIntensity * (1 + changeImpact);
        
        return Math.min(
            Math.max(intensity, this.params.minIntensity),
            this.params.maxIntensity
        );
    }

    shouldSpawnNewPoints(trends) {
        // Spawn new points when we see significant changes
        return (
            Math.abs(trends.volumeChange) > this.params.volumeChangeThreshold ||
            Math.abs(trends.volatilityChange) > this.params.volatilityThreshold
        );
    }

    getRandomSpawnPosition() {
        // Generate random coordinates for new virus points
        return [
            Math.random() * 360 - 180,  // Longitude: -180 to 180
            Math.random() * 160 - 80    // Latitude: -80 to 80 (avoiding poles)
        ];
    }
} 