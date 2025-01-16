import axios from 'axios';

export class SolanaTrackerService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://data.solanatracker.io';
        this.tokenDataCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    isCacheExpired(timestamp) {
        return Date.now() - timestamp > this.cacheTimeout;
    }

    async fetchTokenData(tokenAddress) {
        try {
            // Check cache first
            const cachedData = this.tokenDataCache.get(tokenAddress);
            if (cachedData && !this.isCacheExpired(cachedData.timestamp)) {
                console.log('Using cached token data');
                return cachedData.data;
            }

            console.log('Fetching fresh token data from SolanaTracker');
            
            // Add rate limiting delay
            console.log('Rate limit: waiting 1000ms before next request');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Fetch token data
            const tokenResponse = await axios.get(
                `${this.baseUrl}/tokens/${tokenAddress}`,
                { headers: { 'x-api-key': this.apiKey } }
            );
            console.log('Request successful:', `${this.baseUrl}/tokens/${tokenAddress}`);

            const processedData = {
                tokenData: tokenResponse.data,
                marketMetrics: this.extractMarketMetrics(tokenResponse.data)
            };

            // Update cache
            this.tokenDataCache.set(tokenAddress, {
                data: processedData,
                timestamp: Date.now()
            });

            return processedData;
        } catch (error) {
            console.error('Error fetching token data:', error.message);
            throw error;
        }
    }

    extractMarketMetrics(data) {
        const metrics = {
            volatility: '0.00',
            volume: '0.00',
            transactions: 0,
            price: '0.00',
            marketCap: '0.00'
        };

        try {
            // Calculate volatility from price changes
            if (data.events) {
                const priceChanges = Object.values(data.events)
                    .map(event => Math.abs(event.priceChangePercentage || 0));
                metrics.volatility = (priceChanges.reduce((sum, val) => sum + val, 0) / priceChanges.length || 0)
                    .toFixed(2);
            }

            // Get main pool data
            if (data.pools && data.pools.length > 0) {
                const mainPool = data.pools[0];
                metrics.price = mainPool.price?.usd?.toFixed(2) || '0.00';
                metrics.marketCap = mainPool.marketCap?.usd?.toFixed(2) || '0.00';
                metrics.volume = mainPool.liquidity?.usd?.toFixed(2) || '0.00';
                metrics.transactions = data.txns || 0;
            }

            console.log('Extracted market metrics:', metrics);
            return metrics;
        } catch (error) {
            console.error('Error extracting market metrics:', error);
            return metrics;
        }
    }

    async processTokenData(tokenAddress) {
        try {
            const data = await this.fetchTokenData(tokenAddress);
            return data.marketMetrics;
        } catch (error) {
            console.error('Error processing token data:', error);
            throw error;
        }
    }
}
