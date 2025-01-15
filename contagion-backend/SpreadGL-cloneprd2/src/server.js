const express = require('express');
const path = require('path');
const http = require('http');
const SimulationServer = require('./server/SimulationServer').default;

const app = express();
const server = http.createServer(app);

// Create simulation server
const simulationServer = new SimulationServer(server);

// Add CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        simulation: simulationServer.simulation.getState().status
    });
});

// API endpoints for simulation control
app.post('/api/simulation/control', express.json(), (req, res) => {
    const { action } = req.body;
    switch (action) {
        case 'start':
            simulationServer.simulation.start();
            break;
        case 'stop':
            simulationServer.simulation.stop();
            break;
        case 'reset':
            simulationServer.simulation.reset();
            break;
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }
    res.json({ status: 'ok' });
});

// Get current simulation state
app.get('/api/simulation/state', (req, res) => {
    res.json(simulationServer.simulation.getState());
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 