import { request, gql } from 'graphql-request';

export class BitqueryService {
    constructor() {
        this.endpoint = 'https://graphql.bitquery.io';
        this.apiKey = 'BQYwkFTQIpjJIGFPffK1nFKGMtRjlvzj';
        this.defaultMintAddress = '7XJiwLDrjzxDYdZipnJXzpr1iDTmK55XixSFAa7JgNEL';
        this.cache = {
            lastUpdate: null,
            data: null
        };
        this.cacheTimeout = 5000; // 5 seconds
    }

    async fetchTokenData(mintAddress = this.defaultMintAddress) {
        // Check cache first
        if (this.cache.data && this.cache.lastUpdate && 
            Date.now() - this.cache.lastUpdate < this.cacheTimeout) {
            return this.cache.data;
        }

        const query = gql`
            query ($mintAddress: String!) {
                solana {
                    transfers(
                        options: {limit: 24, desc: "block.height"}
                        currency: {is: $mintAddress}
                    ) {
                        amount
                        block {
                            height
                            timestamp {
                                time
                            }
                        }
                        transaction {
                            signature
                        }
                        currency {
                            symbol
                            name
                        }
                    }
                }
            }
        `;

        try {
            const variables = { mintAddress };
            const headers = {
                'X-API-KEY': this.apiKey,
            };

            const response = await request(this.endpoint, query, variables, headers);
            
            // Process the data
            const transfers = response.solana.transfers;
            const processedData = this.processTransferData(transfers);

            // Update cache
            this.cache = {
                lastUpdate: Date.now(),
                data: processedData
            };

            return processedData;
        } catch (error) {
            console.error('Error fetching token data:', error);
            throw error;
        }
    }

    processTransferData(transfers) {
        if (!transfers || transfers.length === 0) {
            return null;
        }

        // Calculate metrics from the last 24 transfers
        const amounts = transfers.map(t => parseFloat(t.amount) || 0);
        const timestamps = transfers.map(t => new Date(t.block.timestamp.time).getTime());
        
        return {
            latestTransfer: amounts[0],
            totalVolume: amounts.reduce((a, b) => a + b, 0),
            transactionCount: transfers.length,
            tokenInfo: {
                symbol: transfers[0]?.currency?.symbol,
                name: transfers[0]?.currency?.name
            },
            volatility: this.calculateVolatility(amounts),
            lastUpdate: transfers[0]?.block?.timestamp?.time || new Date().toISOString(),
            blockHeight: transfers[0]?.block?.height
        };
    }

    calculateVolatility(amounts) {
        if (amounts.length < 2) return 0;
        
        // Calculate standard deviation of amount changes
        const changes = amounts.slice(0, -1)
            .map((amount, i) => ((amount - amounts[i + 1]) / amounts[i + 1]) * 100);
        
        const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
        const variance = changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;
        
        return Math.sqrt(variance);
    }
} 