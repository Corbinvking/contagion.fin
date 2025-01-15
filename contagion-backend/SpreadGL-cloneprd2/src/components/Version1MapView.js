import React, { useEffect, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import RouteSystem from './RouteSystem';
import VirusSystem from './VirusSystem';
import '../styles/map.css';

const INITIAL_VIEW_STATE = {
    longitude: 139.6917,
    latitude: 0,
    zoom: 3,
    pitch: 0,
    bearing: 0
};

const Version1MapView = () => {
    const [layers, setLayers] = useState([]);
    const routeSystemRef = useRef(null);
    const virusSystemRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastFrameTimeRef = useRef(Date.now());

    useEffect(() => {
        const initialize = async () => {
            try {
                console.log('Initializing systems...');
                
                routeSystemRef.current = new RouteSystem();
                await routeSystemRef.current.initialize();
                console.log('Route system initialized');

                virusSystemRef.current = new VirusSystem();
                virusSystemRef.current.initialize([-74.006, 40.7128]);
                console.log('Virus system initialized');

                const animate = () => {
                    const now = Date.now();
                    const deltaTime = (now - lastFrameTimeRef.current) / 1000;
                    lastFrameTimeRef.current = now;

                    routeSystemRef.current?.update(deltaTime);
                    virusSystemRef.current?.update(deltaTime);

                    const routeLayers = routeSystemRef.current?.getLayers() || [];
                    const virusLayers = virusSystemRef.current?.getLayers() || [];
                    
                    setLayers([...virusLayers, ...routeLayers]);
                    animationFrameRef.current = requestAnimationFrame(animate);
                };

                animate();
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };

        initialize();
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div className="map-container">
            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={{
                    dragRotate: false,
                    touchRotate: false,
                    keyboard: false,
                    dragPan: true,
                    touchZoom: true,
                    doubleClickZoom: true,
                    scrollZoom: true
                }}
                layers={layers}
            >
                <Map
                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                    dragRotate={false}
                    dragPan={true}
                    scrollZoom={true}
                    doubleClickZoom={true}
                    touchZoom={true}
                    interactive={true}
                />
            </DeckGL>
        </div>
    );
};

export default Version1MapView; 