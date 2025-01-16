import { SolanaTrackerService } from './soltracker.js';
import EventEmitter from 'events';

export class MarketDataStream extends EventEmitter {
    constructor(options = {}) {
        super();
        this.solanaTrackerService = new SolanaTrackerService('cc9bbf56-4407-4b57-a56c-0e184fa58040');
        this.interval = options.interval || 60000; // Default 1 minute
        this.windowSize = options.windowSize || 5; // Keep last 5 data points
        this.dataPoints = [];
        this.isRunning = false;
        this.lastError = null;
        this.defaultTokenAddress = '7XJiwLDrjzxDYdZipnJXzpr1iDTmK55XixSFAa7JgNEL';
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.fetchLoop();
        
        // Emit stream start event
        this.emit('stream:start');
    }

    stop() {
        this.isRunning = false;
        this.emit('stream:stop');
    }

    calculateTrends() {
        if (this.dataPoints.length < 2) return {};

        const latest = this.dataPoints[this.dataPoints.length - 1];
        const oldest = this.dataPoints[0];

        // Calculate percentage changes
        const priceChange = ((latest.marketMetrics.price - oldest.marketMetrics.price) / oldest.marketMetrics.price) * 100;
        const volumeChange = ((latest.marketMetrics.volume - oldest.marketMetrics.volume) / oldest.marketMetrics.volume) * 100;
        const volatilityChange = latest.marketMetrics.volatility - oldest.marketMetrics.volatility;

        return {
            priceChange: priceChange.toFixed(2),
            volumeChange: volumeChange.toFixed(2),
            volatilityChange: volatilityChange.toFixed(2),
            timespan: latest.fetchTimestamp - oldest.fetchTimestamp
        };
    }

    async fetchLoop() {
        while (this.isRunning) {
            try {
                // Fetch new data
                const data = await this.solanaTrackerService.processTokenData(this.defaultTokenAddress);
                
                // Add timestamp to the data
                const dataPoint = {
                    marketMetrics: data,
                    fetchTimestamp: Date.now()
                };

                // Add to rolling window
                this.dataPoints.push(dataPoint);
                
                // Maintain window size
                if (this.dataPoints.length > this.windowSize) {
                    this.dataPoints.shift(); // Remove oldest data point
                }

                // Calculate market trends from window
                const trends = this.calculateTrends();

                // Emit new data event with both current data and trends
                this.emit('data', { current: dataPoint, trends });
                this.lastError = null;

            } catch (error) {
                this.lastError = error;
                this.emit('error', error);
            }

            // Wait for next interval
            await new Promise(resolve => setTimeout(resolve, this.interval));
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            dataPoints: this.dataPoints.length,
            lastUpdate: this.dataPoints[this.dataPoints.length - 1]?.fetchTimestamp,
            lastError: this.lastError?.message,
            windowDuration: this.dataPoints.length > 1 
                ? this.dataPoints[this.dataPoints.length - 1].fetchTimestamp - this.dataPoints[0].fetchTimestamp 
                : 0
        };
    }

    getCurrentData() {
        return this.dataPoints[this.dataPoints.length - 1] || null;
    }

    getWindow() {
        return [...this.dataPoints];
    }
} 