import React, { useEffect, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import { MAPBOX_TOKEN, MAP_STYLE, INITIAL_VIEW_STATE } from '../../config';
import MarketSimulator from '../integration/market-simulator';
import TranslatorBridge from '../integration/translator-bridge';
import VirusStateMachine from '../core/virus-state-machine';
import RouteSystem from '../core/route-system';
import { loadIconAtlas } from '../utils/icon-processor';
import { ensureIconsSetup } from '../utils/setup-icons';
import OrderBookDisplay from './OrderBookDisplay';
import DevPanel from '../../components/DevPanel';
import StageTimelinePanel from './StageTimelinePanel';
import MarketGrowthStages from '../integration/market-growth-stages';

class SimpleSpreadMap {
    constructor() {
        this.state = {
            points: [],
            routes: [],
            borders: [],
            timestamp: Date.now()
        };
        
        // Initialize with a starting point in Florida
        this.addPoint(-81.5158, 27.6648, 1.0);
        this.spreadRate = 1.0;
    }

    addPoint(longitude, latitude, intensity = 1.0) {
        this.state.points.push({
            position: [longitude, latitude],
            intensity,
            radius: 10 * intensity,
            timestamp: Date.now()
        });
    }

    update(deltaTime = 1/30) {
        // Update existing points
        this.state.points = this.state.points.map(point => {
            // Simulate spread
            const spread = this.spreadRate * deltaTime;
            return {
                ...point,
                radius: point.radius + spread,
                intensity: Math.max(0.1, point.intensity - 0.01 * deltaTime)
            };
        });

        // Randomly add new points near existing ones
        if (Math.random() < 0.1 * this.spreadRate) {
            const sourcePoint = this.state.points[Math.floor(Math.random() * this.state.points.length)];
            if (sourcePoint) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 0.5; // ~50km max
                const newLon = sourcePoint.position[0] + Math.cos(angle) * distance;
                const newLat = sourcePoint.position[1] + Math.sin(angle) * distance;
                this.addPoint(newLon, newLat, sourcePoint.intensity * 0.9);
            }
        }

        // Update timestamp
        this.state.timestamp = Date.now();
    }

    boostSpread(factor = 2.0) {
        this.spreadRate *= factor;
    }

    suppressSpread(factor = 0.5) {
        this.spreadRate *= factor;
    }

    getState() {
        return { ...this.state };
    }

    cleanup() {
        // Clean up resources if needed
        this.state.points = [];
        this.state.routes = [];
        this.state.borders = [];
    }
}

export default SimpleSpreadMap; 