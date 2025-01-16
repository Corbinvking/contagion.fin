1. Executive Summary

The goal of this project is to create a system that:

Fetches and caches real-time token market data (market cap, volatility, token price, and transactions) using Bitquery.

Translates the market data into actionable parameters for a virus simulation system.

Integrates the market-driven virus simulation with the existing webhook server.

This system will provide a dynamic and engaging simulation experience driven by real-world cryptocurrency metrics.

2. Objectives

Data Fetching and Caching: Build a robust system to fetch, cache, and update real-time market data for a specific Solana-based token.

example : 

import { request, gql } from 'graphql-request';

const BITQUERY_ENDPOINT = 'https://graphql.bitquery.io';
const BITQUERY_API_KEY = 'your_bitquery_api_key';

const fetchTokenPrice = async (mintAddress: string) => {
  const query = gql`
    query ($mintAddress: String!) {
      solana {
        dexTrades(
          baseCurrency: { is: $mintAddress }
          options: { limit: 1, desc: "block.timestamp.time" }
        ) {
          tradeAmount(in: USD)
          block {
            timestamp {
              time
            }
          }
        }
      }
    }
  `;

  const variables = { mintAddress };

  const headers = {
    'X-API-KEY': BITQUERY_API_KEY,
  };

  const response = await request(BITQUERY_ENDPOINT, query, variables, headers);
  return response.solana.dexTrades[0];
};


Market Actions to Virus Controller: Translate fetched market data into actionable inputs for the virus simulation.

example : 

updateFromMarketData(data) {
  // Adjust spread radius based on market cap growth
  const marketCapChange = data.marketCapGrowth;
  this.params.spreadRadius = Math.max(
    this.params.baseRadius * (1 + marketCapChange / 100),
    this.params.minMultiplier
  );

  // Spawn new spore for price increase
  if (data.priceIncrease > 0) {
    const coordinates = [
      Math.random() * 180 - 90, // Latitude
      Math.random() * 360 - 180 // Longitude
    ];
    this.addPoint(coordinates, 'PRICE_TRIGGERED');
  }

  // Adjust growth multiplier for volatility
  const volatility = data.volatility;
  this.params.growthMultiplier = Math.max(
    this.params.minMultiplier,
    Math.min(
      this.params.growthMultiplier * (1 + volatility / 100),
      this.params.maxMultiplier
    )
  );

  if (this.debugMode) {
    console.log('Market data updated:', {
      spreadRadius: this.params.spreadRadius,
      growthMultiplier: this.params.growthMultiplier,
      newSpore: data.priceIncrease > 0
    });
  }
}


Webhook Integration: Ensure seamless integration with the current webhook server for consistent updates and communication.

3. Functional Requirements

3.1. Data Fetching and Caching

Description: Develop a subsystem to fetch, cache, and manage market data in near real-time.

APIs to Use:

Bitquery for Solana blockchain data.

GraphQL queries for token price, market cap, transactions, and volatility.

Features:

Fetch market data every 5 seconds.

Cache the data in memory for quick access.

Store historical data in Supabase for analytics and backups.

Metrics to Track:

Token price (USD).

Market cap.

Volatility.

Number of transactions.

Error Handling:

Retry mechanism for failed API calls.

Alerts for API rate limits or failures.

3.2. Market Actions to Virus Controller

Description: Map real-time market data to control parameters for the virus simulation system.

Mappings:

Market Cap Growth: Adjust spreadRadius in the virus system.

Token Price Increase: Trigger new spore creation.

Volatility: Modify growthMultiplier to simulate erratic virus behavior.

Transactions Count: Adjust intensityDecayRate or dormantIntensity.

Implementation:

Add a function to process fetched data and update the virus system parameters.

Log all updates for debugging and analysis.

Performance:

Ensure that updates to the virus system occur within 1 second of receiving new market data.

3.3. Webhook Integration

Description: Integrate the new functionality with the existing webhook server to enable constant updates.

Webhook Features:

Send alerts when key metrics (e.g., price or market cap) change significantly.

Provide a summary of changes every minute.

Integration Steps:

Update the webhook server to accept new data payloads.

Ensure data consistency between the webhook and the virus system.

4. Technical Requirements

4.1. Backend Framework

Language: TypeScript

Framework: Next.js

Database: Supabase

4.2. API Integration

Bitquery: Use GraphQL client (graphql-request) for queries.

Endpoints: Token price, market cap, volatility, and transactions.

4.3. System Architecture

Data Layer:

Fetch and cache data in memory.

Persist historical data in Supabase.

Business Logic Layer:

Map market data to virus simulation parameters.

Manage transformations and ensure smooth parameter updates.

Integration Layer:

Update the virus system and notify the webhook server.

5. Non-Functional Requirements

Scalability: Handle data for multiple tokens in future iterations.

Performance: Ensure sub-second response times for all updates.

Reliability: Retry failed API calls up to 3 times before alerting.

Security: Protect API keys and sensitive data using environment variables.

Monitoring: Implement logging and alerts for failures or unusual patterns.

6. Development Milestones

Phase 1: Data Fetching and Caching (2 Weeks)

Set up Bitquery API integration.

Develop the caching mechanism.

Store historical data in Supabase.

Phase 2: Market Actions to Virus Controller (2 Weeks)

Map market data to virus simulation parameters.

Implement dynamic updates in the virus system.

Validate parameter adjustments with test data.

Phase 3: Webhook Integration (1 Week)

Update the webhook server to handle new data payloads.

Ensure real-time updates to the virus system.

Test end-to-end integration.

Phase 4: Testing and Optimization (1 Week)

Conduct performance testing.

Optimize API calls and caching.

Monitor system behavior and debug issues.

7. Risks and Mitigation

API Rate Limits: Implement caching and retry mechanisms.

Data Accuracy: Cross-verify data from multiple sources.

Integration Issues: Perform rigorous testing before deployment.

8. Deliverables

Robust market data fetching and caching system.

Functional mapping of market data to virus simulation controls.

Integrated webhook system for real-time updates.

Documentation for the entire system.

9. Success Criteria

Real-time updates of token data with <1-second delay.

Accurate reflection of market changes in the virus simulation.

Seamless integration with the existing webhook server.

