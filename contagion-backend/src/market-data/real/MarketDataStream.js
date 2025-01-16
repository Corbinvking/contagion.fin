import { BitqueryService } from './BitqueryService.js';
import EventEmitter from 'events';

export class MarketDataStream extends EventEmitter {
    constructor(options = {}) {
        super();
        this.bitqueryService = new BitqueryService();
        this.interval = options.interval || 60000; // Default 1 minute
        this.windowSize = options.windowSize || 5; // Keep last 5 data points
        this.dataPoints = [];
        this.isRunning = false;
        this.lastError = null;
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

    async fetchLoop() {
        while (this.isRunning) {
            try {
                // Fetch new data
                const data = await this.bitqueryService.fetchTokenData();
                
                // Add timestamp to the data
                const dataPoint = {
                    ...data,
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

    calculateTrends() {
        if (this.dataPoints.length < 2) return null;

        const latest = this.dataPoints[this.dataPoints.length - 1];
        const previous = this.dataPoints[this.dataPoints.length - 2];

        return {
            volumeChange: ((latest.totalVolume - previous.totalVolume) / previous.totalVolume) * 100,
            transactionCountChange: ((latest.transactionCount - previous.transactionCount) / previous.transactionCount) * 100,
            volatilityChange: ((latest.volatility - previous.volatility) / previous.volatility) * 100,
            timeDelta: latest.fetchTimestamp - previous.fetchTimestamp,
            windowDuration: latest.fetchTimestamp - this.dataPoints[0].fetchTimestamp
        };
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