import express from 'express';
import { createServer } from 'http';
import SimulationServer from './server/SimulationServer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Create simulation server
const simulationServer = new SimulationServer(server);

// Initialize simulation with routes
await simulationServer.initialize();

// Add all routes from RouteSystem.js
console.log('Loading all routes...');

// Air routes
simulationServer.simulation.routeSystem.addRoute('plane', [151.1772, -33.9462], [103.9915, 1.3644]);     // Sydney to Singapore
simulationServer.simulation.routeSystem.addRoute('plane', [55.3644, 25.2532], [28.2460, -26.1367]);      // Dubai to Johannesburg
simulationServer.simulation.routeSystem.addRoute('plane', [2.5559, 49.0083], [31.4117, 30.1114]);        // Paris to Cairo
simulationServer.simulation.routeSystem.addRoute('plane', [-79.6248, 43.6777], [8.5622, 50.0379]);       // Toronto to Frankfurt
simulationServer.simulation.routeSystem.addRoute('plane', [116.5847, 40.0799], [37.4146, 55.9726]);      // Beijing to Moscow
simulationServer.simulation.routeSystem.addRoute('plane', [-46.4825, -23.4356], [-80.2870, 25.7959]);    // São Paulo to Miami
simulationServer.simulation.routeSystem.addRoute('plane', [77.1015, 28.5555], [100.7501, 13.6900]);      // Delhi to Bangkok
simulationServer.simulation.routeSystem.addRoute('plane', [-99.0721, 19.4361], [-3.5626, 40.4719]);      // Mexico City to Madrid

// Ship routes
simulationServer.simulation.routeSystem.addRoute('ship', [-122.4194, 37.7749], [-149.9003, 61.2181]);    // San Francisco to Anchorage
simulationServer.simulation.routeSystem.addRoute('ship', [139.6917, 35.6895], [132.4553, 34.3853]);      // Tokyo to Hiroshima
simulationServer.simulation.routeSystem.addRoute('ship', [132.4553, 34.3853], [127.6791, 26.2124]);      // Hiroshima to Okinawa
simulationServer.simulation.routeSystem.addRoute('ship', [127.6791, 26.2124], [151.1772, -33.9462]);     // Okinawa to Sydney
simulationServer.simulation.routeSystem.addRoute('ship', [-46.3225, -23.9619], [18.4241, -33.9249]);     // Santos to Cape Town

console.log('All routes loaded. Starting simulation...');
simulationServer.simulation.start();

// Basic middleware
app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Enhanced logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from dist directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Root route and dev-panel route - serve enhanced dev-panel.html
app.get(['/', '/dev-panel', '/dev-panel.html'], (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Simulation Development Panel</title>
            <style>
                body {
                    background: #2d0044;
                    color: white;
                    font-family: monospace;
                    margin: 20px;
                }
                .panel {
                    background: #3d0066;
                    padding: 20px;
                    border-radius: 8px;
                }
                .header {
                    background: #4d0080;
                    padding: 10px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    color: #ff00ff;
                }
                .section {
                    margin-bottom: 20px;
                }
                .route-card {
                    background: #2a2a2a;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 12px;
                }
                .route-header {
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 8px;
                }
                .route-details {
                    font-size: 14px;
                    color: #ccc;
                    margin: 8px 0;
                }
                .live-position {
                    font-size: 14px;
                    color: #4CAF50;
                    margin-top: 8px;
                }
                button {
                    background: #ff00ff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin: 5px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background: #cc00cc;
                }
                .stat-card {
                    background: #4d0080;
                    padding: 10px;
                    margin: 5px 0;
                    border-radius: 4px;
                }
                .spawn-location {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #4d0080;
                    padding: 10px;
                    margin: 5px 0;
                    border-radius: 4px;
                }
                .spawn-location button {
                    min-width: 100px;
                }
                .location-name {
                    flex-grow: 1;
                    margin-right: 10px;
                }
                .param-controls {
                    background: #4d0080;
                    padding: 15px;
                    margin-top: 15px;
                    border-radius: 4px;
                }
                .slider-group {
                    margin: 10px 0;
                    display: flex;
                    flex-direction: column;
                }
                .slider-group label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 5px;
                }
                .slider-group input[type="range"] {
                    flex: 1;
                    background: #2d0044;
                }
                .slider-value {
                    min-width: 50px;
                    text-align: right;
                }
                h4 {
                    color: #ff00ff;
                    margin: 0 0 15px 0;
                }
                .spore-details {
                    margin-top: 5px;
                    font-size: 0.9em;
                    max-height: 100px;
                    overflow-y: auto;
                }
                .spore-item {
                    background: #2a2a2a;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .spore-item .id {
                    font-weight: bold;
                    color: #4CAF50;
                }
                .spore-item .location {
                    color: #ccc;
                    font-family: monospace;
                }
                .spore-item .stats {
                    color: #fff;
                    line-height: 1.4;
                }
                .no-spores {
                    color: #666;
                    font-style: italic;
                    padding: 12px;
                    text-align: center;
                }
                .growth-state {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: #4CAF50;
                    color: white;
                    font-weight: bold;
                }
                .spawn-controls {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    margin-top: 10px;
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .input-group input {
                    background: #2d0044;
                    border: 1px solid #ff00ff;
                    color: white;
                    padding: 5px;
                    border-radius: 4px;
                    width: 120px;
                }
                .input-group label {
                    font-size: 12px;
                    color: #ccc;
                }
                .pattern {
                    font-size: 0.9em;
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-left: 4px;
                }
                .pattern.normal {
                    background: #ff0000;
                    color: white;
                }
                .pattern.vector {
                    background: #ffa500;
                    color: white;
                }
                .pattern.burst {
                    background: #8b0000;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="panel">
                <div class="header">
                    <h2>Simulation Development Panel</h2>
                </div>
                
                <div class="section">
                    <h3>Simulation Control</h3>
                    <button onclick="controlSimulation('start')">Start</button>
                    <button onclick="controlSimulation('stop')">Stop</button>
                    <button onclick="controlSimulation('reset')">Reset</button>
                </div>

                <div class="section">
                    <h3>Route Status</h3>
                    <div class="stat-card">
                        <div>Routes: <span id="routeCount">0</span></div>
                        <div>Vehicles: <span id="vehicleCount">0</span></div>
                    </div>
                    <div id="routeDetails">
                        <!-- Route details will be populated here -->
                    </div>
                </div>

                <div class="section">
                    <h3>Virus System</h3>
                    <button onclick="controlSimulation('virus_boost')">Boost Spread</button>
                    <button onclick="controlSimulation('virus_suppress')">Suppress Spread</button>
                    <button onclick="controlSimulation('virus_toggleCycle')">Toggle Auto Cycle</button>
                </div>
                    
                    <div class="stat-card">
                    <h4>Spawn Virus</h4>
                    <div class="spawn-controls">
                        <div class="input-group">
                            <label>Longitude (-180° to 180°):</label>
                            <input type="number" 
                                id="spawnLongitude" 
                                step="0.0001" 
                                value="0" 
                                min="-180" 
                                max="180"
                                placeholder="e.g., -73.935242">
                        </div>
                        <div class="input-group">
                            <label>Latitude (-90° to 90°):</label>
                            <input type="number" 
                                id="spawnLatitude" 
                                step="0.0001" 
                                value="0" 
                                min="-90" 
                                max="90"
                                placeholder="e.g., 40.730610">
                        </div>
                        <div class="button-group">
                            <button onclick="spawnVirus('NORMAL')" style="background: #ff0000">Normal Spawn</button>
                            <button onclick="spawnVirus('VECTOR')" style="background: #ffa500">Vector Spawn</button>
                            <button onclick="spawnVirus('BURST')" style="background: #8b0000">Burst Spawn</button>
                        </div>
                    </div>
                    </div>

                    <div class="stat-card">
                    <div>Total Points: <span id="pointCount">0</span></div>
                        <div>Active Spores: <span id="sporeCount">0</span></div>
                    <div>Coverage: <span id="coverage">0%</span></div>
                    </div>

                    <div class="stat-card">
                    <h4>Active Spores</h4>
                    <div id="sporeDetails" class="spore-details">
                        <!-- Spore details will be populated here -->
                    </div>
                </div>

                <div class="param-controls">
                    <h4>Virus Parameters</h4>
                    <div class="slider-group">
                        <label>Growth Multiplier (0.1 - 5.0):
                            <input type="range" 
                                min="0.1" 
                                max="5.0" 
                                step="0.1" 
                                value="1.0"
                                oninput="updateVirusParam('growthMultiplier', this.value)"
                            >
                            <span class="slider-value">1.0</span>
                        </label>
                        </div>
                    <div class="slider-group">
                        <label>Point Generation Rate (0.01 - 1.0):
                            <input type="range" 
                                min="0.01" 
                                max="1.0" 
                                step="0.01" 
                                value="0.1"
                                oninput="updateVirusParam('pointGenerationRate', this.value)"
                            >
                            <span class="slider-value">0.1</span>
                        </label>
                        </div>
                    <div class="slider-group">
                        <label>Spread Radius (0.1 - 2.0):
                            <input type="range" 
                                min="0.1" 
                                max="2.0" 
                                step="0.1" 
                                value="0.5"
                                oninput="updateVirusParam('spreadRadius', this.value)"
                            >
                            <span class="slider-value">0.5</span>
                        </label>
                        </div>
                    <div class="slider-group">
                        <label>Base Radius (5 - 30):
                            <input type="range" 
                                min="5" 
                                max="30" 
                                step="1" 
                                value="10"
                                oninput="updateVirusParam('baseRadius', this.value)"
                            >
                            <span class="slider-value">10</span>
                        </label>
                        </div>
                    <div class="slider-group">
                        <label>Color Intensity (0.1 - 1.0):
                            <input type="range" 
                                min="0.1" 
                                max="1.0" 
                                step="0.1" 
                                value="0.5"
                                oninput="updateVirusParam('colorIntensity', this.value)"
                            >
                            <span class="slider-value">0.5</span>
                        </label>
                        </div>
                    <div class="slider-group">
                        <label>Intensity (0.1 - 1.0):
                            <input type="range" 
                                min="0.1" 
                                max="1.0" 
                                step="0.1" 
                                value="0.5"
                                oninput="updateVirusParam('intensity', this.value)"
                            >
                            <span class="slider-value">0.5</span>
                        </label>
                    </div>
                </div>
            </div>

            <script>
                // Define all functions first
                function updateStatus() {
                    fetch('/api/simulation/state')
                        .then(response => response.json())
                        .then(state => {
                            const { layers } = state;
                            const routeState = layers.route || {};
                            const virusState = layers.virus || {};

                            // Safely update elements with null checks
                            const updateElement = (id, value) => {
                                const element = document.getElementById(id);
                                if (element) {
                                    element.textContent = value;
                                }
                            };

                            // Update route status
                            updateElement('routeCount', routeState.paths?.data?.length || 0);
                            updateElement('vehicleCount', routeState.vehicles?.data?.length || 0);

                            // Update route details
                            const routeDetails = document.getElementById('routeDetails');
                            if (routeDetails && routeState.paths?.data) {
                                const vehicles = routeState.vehicles?.data || [];
                                const paths = routeState.paths.data;
                                
                                routeDetails.innerHTML = paths.map((path, index) => {
                                    // Find vehicle by matching route index
                                    const vehicle = vehicles.find(v => v.pathIndex === index);
                                    const vehiclePosition = vehicle 
                                        ? '[' + vehicle.position[0].toFixed(2) + ', ' + vehicle.position[1].toFixed(2) + ']'
                                        : 'No vehicle';
                                
                                return '<div class="route-card">' +
                                        '<div class="route-header">Route #' + (index + 1) + ' (' + path.type + ')</div>' +
                                        '<div class="route-details">Start: [' + path.start[0].toFixed(2) + ', ' + path.start[1].toFixed(2) + ']</div>' +
                                        '<div class="route-details">End: [' + path.end[0].toFixed(2) + ', ' + path.end[1].toFixed(2) + ']</div>' +
                                        '<div class="live-position">Vehicle Position: ' + vehiclePosition + '</div>' +
                                    '</div>';
                            }).join('');
                            }

                            // Update virus status
                            updateElement('pointCount', virusState.points?.data?.length || 0);
                            updateElement('sporeCount', virusState.sporeStates?.length || 0);
                            updateElement('coverage', ((virusState.coverage || 0) * 100).toFixed(1) + '%');

                            // Update spore details
                            const sporeDetails = document.getElementById('sporeDetails');
                            if (sporeDetails && virusState.sporeStates) {
                                sporeDetails.innerHTML = virusState.sporeStates.map(spore => {
                                    const pattern = spore.pattern || 'NORMAL';
                                    const patternClass = pattern.toLowerCase();
                                    return '<div class="spore-item">' +
                                        '<div>Spore #' + spore.id + ' <span class="pattern-label ' + patternClass + '">' + pattern + '</span></div>' +
                                        '<div>[' + spore.position[0].toFixed(2) + ', ' + spore.position[1].toFixed(2) + ']</div>' +
                                        '<div>Points: ' + (spore.totalPoints || 0) + '</div>' +
                                        '<div>Coverage: ' + ((spore.coverage || 0) * 100).toFixed(1) + '%</div>' +
                                        '<div>Age: ' + spore.age.toFixed(1) + 's</div>' +
                                        '</div>';
                                }).join('');
                            }
                        })
                        .catch(error => console.error('Error updating status:', error));
                }

                function controlSimulation(action, pattern) {
                    const data = { action };
                    if (pattern) {
                        data.pattern = pattern;
                    }
                    
                    fetch('/api/simulation/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to control simulation');
                        return response.json();
                    })
                    .then(result => {
                        if (pattern) {
                            document.getElementById('currentPattern').textContent = pattern;
                        }
                        console.log('Control action successful:', result);
                    })
                    .catch(error => console.error('Error in simulation control:', error));
                }

                async function spawnVirus(pattern = 'NORMAL') {
                    try {
                        const longitude = parseFloat(document.getElementById('spawnLongitude').value);
                        const latitude = parseFloat(document.getElementById('spawnLatitude').value);

                        // Validate coordinates
                        if (isNaN(longitude) || isNaN(latitude)) {
                            throw new Error('Please enter valid coordinates');
                        }

                        // Validate longitude range (-180° to 180°)
                        if (longitude < -180 || longitude > 180) {
                            throw new Error('Longitude must be between -180° and 180°');
                        }

                        // Validate latitude range (-90° to 90°)
                        if (latitude < -90 || latitude > 90) {
                            throw new Error('Latitude must be between -90° and 90°');
                        }

                        console.log('Attempting to spawn virus with:', {
                            coordinates: [longitude, latitude],
                            pattern: pattern
                        });

                        const response = await fetch('/api/simulation/control', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                action: 'virus_spawn',
                                params: {
                                    coordinates: [longitude, latitude],
                                    pattern: pattern
                                }
                            })
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            let errorMessage;
                            try {
                                const errorJson = JSON.parse(errorText);
                                errorMessage = errorJson.error || errorJson.details || errorText;
                            } catch {
                                errorMessage = errorText;
                            }
                            throw new Error(errorMessage);
                        }

                        const result = await response.json();
                        console.log('Virus spawned successfully:', result);
                        return result;
                    } catch (error) {
                        console.error('Error spawning virus:', error);
                        alert('Failed to spawn virus: ' + error.message);
                        throw error;
                    }
                }

                function updateVirusParam(param, value) {
                    // Update the displayed value
                    const slider = event.target;
                    const valueDisplay = slider.parentElement.querySelector('.slider-value');
                    valueDisplay.textContent = parseFloat(value).toFixed(2);

                    // Send to server
                    fetch('/api/simulation/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            action: 'virus_param_update',
                            param: param,
                            value: parseFloat(value)
                        })
                    });
                }

                // Add CSS for pattern labels
                const patternStyles = '' +
                    '.pattern-label {' +
                    '  display: inline-block;' +
                    '  padding: 2px 6px;' +
                    '  border-radius: 3px;' +
                    '  font-size: 0.8em;' +
                    '  margin-left: 5px;' +
                    '}' +
                    '.normal {' +
                    '  background-color: #ff4444;' +
                    '  color: white;' +
                    '}' +
                    '.vector {' +
                    '  background-color: #ff8800;' +
                    '  color: white;' +
                    '}' +
                    '.burst {' +
                    '  background-color: #cc0000;' +
                    '  color: white;' +
                    '}';

                const style = document.createElement('style');
                style.textContent = patternStyles;
                document.head.appendChild(style);

                // Start the status updates
                setInterval(updateStatus, 1000);
                updateStatus();
            </script>
        </body>
        </html>
    `;
    res.send(html);
});

// API routes
app.post('/api/simulation/control', (req, res) => {
    const { action, type, start, end, label, location } = req.body;
    console.log(`Received control action: ${action}`);

    try {
        switch (action) {
            case 'start':
                simulationServer.simulation.start();
                break;
            case 'stop':
                simulationServer.simulation.stop();
                break;
            case 'reset':
                // Stop the simulation first
                simulationServer.simulation.stop();
                
                // Store current routes
                const currentRoutes = simulationServer.simulation.routeSystem.routes;
                
                // Reset the simulation
                simulationServer.simulation.reset();
                
                // Re-add all routes
                console.log('Restoring routes after reset...');
                currentRoutes.forEach(route => {
                    simulationServer.simulation.routeSystem.addRoute(route.type, route.start, route.end);
                });
                
                // Restart the simulation
                simulationServer.simulation.start();
                break;
            case 'add_route':
                console.log(`Adding route: ${label} (${type})`);
                console.log(`Start: [${start}], End: [${end}]`);
                simulationServer.simulation.routeSystem.addRoute(type, start, end);
                break;
            case 'virus_boost':
                try {
                    console.log('Attempting to boost virus spread');
                    if (!simulationServer.simulation?.virusSystem) {
                        throw new Error('Virus system not initialized');
                    }
                simulationServer.simulation.virusSystem.boostSpread();
                    console.log('Virus boost successful');
                    res.json({ 
                        success: true,
                        currentMultiplier: simulationServer.simulation.virusSystem.params.growthMultiplier
                    });
                } catch (error) {
                    console.error('Failed to boost virus:', error);
                    res.status(500).json({ error: 'Failed to boost virus spread' });
                }
                break;
            case 'virus_suppress':
                try {
                    console.log('Attempting to suppress virus spread');
                    if (!simulationServer.simulation?.virusSystem) {
                        throw new Error('Virus system not initialized');
                    }
                simulationServer.simulation.virusSystem.suppressSpread();
                    console.log('Virus suppression successful');
                    res.json({ 
                        success: true,
                        currentMultiplier: simulationServer.simulation.virusSystem.params.growthMultiplier
                    });
                } catch (error) {
                    console.error('Failed to suppress virus:', error);
                    res.status(500).json({ error: 'Failed to suppress virus spread' });
                }
                break;
            case 'virus_toggleCycle':
                simulationServer.simulation.virusSystem.autoCycleEnabled = 
                    !simulationServer.simulation.virusSystem.autoCycleEnabled;
                break;
            case 'virus_spawn':
                const { coordinates, pattern } = req.body.params;
                if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
                    console.error('Invalid spawn coordinates format:', coordinates);
                    return res.status(400).json({ error: 'Invalid coordinates format' });
                }

                try {
                    if (!simulationServer.simulation?.virusSystem) {
                        throw new Error('Virus system not initialized');
                    }
                    
                    const [x, y] = coordinates;
                    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
                        throw new Error('Invalid coordinate values');
                    }
                    
                    // Pass coordinates as an array to addPoint
                    simulationServer.simulation.virusSystem.addPoint(coordinates);
                    
                    console.log('Virus spawn successful at:', coordinates, 'with pattern:', pattern);
                    return res.json({ 
                        success: true, 
                        coordinates,
                        pattern,
                        state: simulationServer.simulation.getState()
                    });
                } catch (error) {
                    console.error('Failed to spawn virus:', error);
                    return res.status(500).json({ 
                        error: 'Failed to spawn virus',
                        details: error.message
                    });
                }
                break;
            case 'virus_param_update':
                try {
                    const { param, value } = req.body;
                    console.log(`Updating virus parameter: ${param} = ${value}`);
                    
                    if (!simulationServer.simulation?.virusSystem) {
                        throw new Error('Virus system not initialized');
                    }

                    // Validate parameter exists
                    if (!(param in simulationServer.simulation.virusSystem.params)) {
                        throw new Error(`Invalid parameter: ${param}`);
                    }

                    // Update the parameter
                    simulationServer.simulation.virusSystem.params[param] = value;
                    
                    console.log('Parameter update successful');
                    res.json({ 
                        success: true,
                        param,
                        value,
                        currentParams: simulationServer.simulation.virusSystem.params
                    });
                } catch (error) {
                    console.error('Failed to update virus parameter:', error);
                    res.status(500).json({ 
                        error: 'Failed to update virus parameter',
                        details: error.message
                    });
                }
                break;
            case 'virus_pattern':
                try {
                    const { pattern } = req.body;
                    console.log('Setting virus pattern to:', pattern);
                    
                    if (!simulationServer.simulation?.virusSystem) {
                        throw new Error('Virus system not initialized');
                    }
                    
                    simulationServer.simulation.virusSystem.setGrowthPattern(pattern);
                    
                    res.json({ 
                        success: true,
                        pattern,
                        state: simulationServer.simulation.getState()
                    });
                } catch (error) {
                    console.error('Failed to set virus pattern:', error);
                    res.status(500).json({ 
                        error: 'Failed to set virus pattern',
                        details: error.message
                    });
                }
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error in control handler:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/simulation/state', (req, res) => {
    try {
        const state = simulationServer.simulation.getState();
        res.json(state);
    } catch (err) {
        console.error('State error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    const state = simulationServer.simulation.getState();
    res.json({
        status: 'ok',
        simulation: {
            isRunning: state.status.isRunning,
            routeSystem: {
                active: state.status.routeSystem,
                paths: state.layers.route?.paths?.data?.length || 0,
                endpoints: state.layers.route?.endpoints?.data?.length || 0,
                vehicles: state.layers.route?.vehicles?.data?.length || 0
            },
            virusSystem: {
                active: state.status.virusSystem,
                points: state.layers.virus?.points?.data?.length || 0
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Server Error');
});

// 404 handler
app.use((req, res) => {
    console.log(`[404] Not Found: ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('\nEndpoints:');
    console.log('- GET  / (Enhanced Dev Panel)');
    console.log('- POST /api/simulation/control');
    console.log('- GET  /api/simulation/state');
    console.log('- GET  /health');
}); 