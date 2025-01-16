import React, { useEffect, useState, useCallback, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import { ScatterplotLayer, PathLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import { WebMercatorViewport, COORDINATE_SYSTEM } from '@deck.gl/core';
import type { Color } from '@deck.gl/core';
import type { Texture } from '@luma.gl/core';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Types
interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    maxZoom: number;
    minZoom: number;
}

interface RouteData {
    start: [number, number];
    end: [number, number];
}

interface EndpointData {
    position: [number, number];
    isStart: boolean;
    label: string;
}

interface VehicleData {
    type: 'plane' | 'ship';
    position: [number, number];
    angle: number;
}

interface VirusPoint {
    position: [number, number];
    colorIntensity: number;
    radius: number;
}

interface SimulationState {
    layers: {
        route?: {
            paths?: { data: RouteData[] };
            endpoints?: { data: EndpointData[] };
            vehicles?: { data: VehicleData[] };
        };
        virus?: {
            points?: { data: VirusPoint[] };
        };
    };
    timestamp?: number;
    performance?: any;
}

// Constants
const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL;

const INITIAL_VIEW_STATE: ViewState = {
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    pitch: 0,
    bearing: 0,
    maxZoom: 20,
    minZoom: 1
};

// Change map style to Voyager
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// Create icon atlas
const createIconAtlas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Clear background
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 64, 32);

    // Draw plane icon (left half)
    ctx.fillStyle = '#00F7C3';  // Bright cyan for planes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    // Main triangle for plane
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.lineTo(4, 26);
    ctx.lineTo(28, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wings for plane
    ctx.beginPath();
    ctx.moveTo(12, 20);
    ctx.lineTo(20, 20);
    ctx.lineTo(16, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw ship icon (right half)
    ctx.fillStyle = '#FFA500';  // Orange for ships
    ctx.beginPath();
    ctx.moveTo(36, 20);
    ctx.lineTo(42, 8);
    ctx.lineTo(56, 8);
    ctx.lineTo(60, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    return canvas as HTMLCanvasElement & Texture;
};

// Update path layer colors and styling for better visibility on lighter background
const PATH_COLOR: Color = [65, 85, 175];  // Darker blue for routes
const ENDPOINT_COLORS = {
    START: [255, 140, 0] as Color,  // Orange for start points
    END: [0, 100, 255] as Color     // Blue for end points
};

// Main Component
const MapViewer: React.FC = () => {
    const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [performance, setPerformance] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastMessageTime = useRef<number>(Date.now());
    const iconAtlasRef = useRef<(HTMLCanvasElement & Texture) | null>(null);

    useEffect(() => {
        const atlas = createIconAtlas();
        if (atlas) {
            iconAtlasRef.current = atlas;
            setSimulationState((prev: any) => ({...prev}));
        }
    }, []);

    // WebSocket connection handler
    useEffect(() => {
        const connectWebSocket = () => {
            if (ws.current?.readyState === WebSocket.OPEN) return;

            try {
                ws.current = new WebSocket(BACKEND_WS_URL);

                ws.current.onopen = () => {
                    console.log('Connected to simulation server');
                    setConnected(true);
                    setError(null);
                    lastMessageTime.current = Date.now();
                };

                ws.current.onclose = () => {
                    console.log('Disconnected from simulation server');
                    setConnected(false);
                    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
                    reconnectTimeout.current = setTimeout(connectWebSocket, 2000);
                };

                ws.current.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        lastMessageTime.current = Date.now();

                        if (message.type === 'simulation_update' || message.type === 'initial_state') {
                            setSimulationState(message.data);
                            if (message.data.performance) setPerformance(message.data.performance);
                        }
                    } catch (err) {
                        console.error('Error processing message:', err);
                        setError('Error processing server message');
                    }
                };

                ws.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('Failed to connect to simulation server');
                };
            } catch (err) {
                console.error('Error creating WebSocket:', err);
                setError('Failed to create WebSocket connection');
                reconnectTimeout.current = setTimeout(connectWebSocket, 2000);
            }
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (ws.current) ws.current.close();
        };
    }, []);

    // Layer counts for debug overlay
    const layerCounts = React.useMemo(() => ({
        routes: (
            (simulationState?.layers?.route?.paths?.data?.length || 0) +
            (simulationState?.layers?.route?.endpoints?.data?.length || 0) +
            (simulationState?.layers?.route?.vehicles?.data?.length || 0)
        ),
        virus: simulationState?.layers?.virus?.points?.data?.length || 0
    }), [simulationState]);

    // Combine all layers
    const layers = React.useMemo(() => {
        if (!simulationState?.layers || !iconAtlasRef.current) return [];

        const allLayers = [];
        
        // Add route layers
        if (simulationState.layers.route) {
            // Paths with dashed lines
            if (simulationState.layers.route.paths?.data) {
                allLayers.push(
                    new PathLayer<RouteData>({
                        id: 'route-paths',
                        data: simulationState.layers.route.paths.data,
                        getPath: (d: RouteData) => [d.start, d.end],
                        getColor: PATH_COLOR,
                        getWidth: 1,
                        widthMinPixels: 1,
                        opacity: 0.8,
                        getDashArray: [1, 8],
                        parameters: {
                            depthWrite: false,
                            blend: true,
                            blendFunc: [770, 771]
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPath: simulationState.timestamp
                        }
                    })
                );
            }

            // Endpoints with labels
            if (simulationState.layers.route.endpoints?.data) {
                allLayers.push(
                    new ScatterplotLayer<EndpointData>({
                        id: 'route-endpoints',
                        data: simulationState.layers.route.endpoints.data,
                        getPosition: (d: EndpointData) => d.position,
                        getFillColor: (d: EndpointData) => d.isStart ? ENDPOINT_COLORS.START : ENDPOINT_COLORS.END,
                        getRadius: 6,
                        radiusMinPixels: 4,
                        parameters: {
                            depthWrite: false,
                            blend: true
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPosition: simulationState.timestamp
                        }
                    })
                );

                allLayers.push(
                    new TextLayer<EndpointData>({
                        id: 'endpoint-labels',
                        data: simulationState.layers.route.endpoints.data,
                        getPosition: (d: EndpointData) => d.position,
                        getText: (d: EndpointData) => d.label,
                        getSize: 14,
                        getColor: [25, 25, 25],
                        getAngle: 0,
                        getTextAnchor: 'middle',
                        getAlignmentBaseline: 'center',
                        getPixelOffset: [0, -20],
                        parameters: {
                            depthWrite: false,
                            blend: true
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPosition: simulationState.timestamp
                        }
                    })
                );
            }

            // Vehicles with proper icons
            if (simulationState.layers.route.vehicles?.data) {
                allLayers.push(
                    new IconLayer<VehicleData>({
                        id: 'vehicle-layer',
                        data: simulationState.layers.route.vehicles.data,
                        iconAtlas: iconAtlasRef.current,
                        iconMapping: {
                            plane: { x: 0, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 },
                            ship: { x: 32, y: 0, width: 32, height: 32, mask: true, anchorY: 16, anchorX: 16 }
                        },
                        getIcon: (d: VehicleData) => d.type,
                        getPosition: (d: VehicleData) => d.position,
                        getSize: (d: VehicleData) => d.type === 'plane' ? 20 : 16,
                        getAngle: (d: VehicleData) => d.angle + 90,
                        sizeScale: 1,
                        sizeUnits: 'pixels',
                        sizeMinPixels: 10,
                        sizeMaxPixels: 20,
                        parameters: {
                            depthWrite: false,
                            blend: true
                        },
                        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                        updateTriggers: {
                            getPosition: simulationState.timestamp,
                            getAngle: simulationState.timestamp
                        }
                    })
                );
            }
        }

        // Virus layer
        if (simulationState.layers.virus?.points?.data) {
            allLayers.push(
                new ScatterplotLayer<VirusPoint>({
                    id: 'virus-points',
                    data: simulationState.layers.virus.points.data,
                    getPosition: (d: VirusPoint) => d.position,
                    getFillColor: (d: VirusPoint) => [
                        200,
                        0,
                        0,
                        Math.floor(255 * d.colorIntensity)
                    ],
                    getRadius: (d: VirusPoint) => d.radius,
                    radiusMinPixels: 3,
                    radiusMaxPixels: 15,
                    parameters: {
                        depthWrite: false,
                        blend: true,
                        blendFunc: [770, 771]
                    },
                    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
                    updateTriggers: {
                        getPosition: simulationState.timestamp,
                        getRadius: simulationState.timestamp,
                        getFillColor: simulationState.timestamp
                    }
                })
            );
        }

        return allLayers;
    }, [simulationState]);

    return (
        <>
            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={false}
                layers={layers}
            >
                <Map
                    mapStyle={MAP_STYLE}
                    mapLib={maplibregl as any}
                    interactive={false}
                />
            </DeckGL>
        </>
    );
};

export default MapViewer; 