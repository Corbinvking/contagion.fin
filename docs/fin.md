I'll provide a comprehensive list of files we've interacted with, along with their purpose and significance in the workflow:

### Core Server Files
1. `SpreadGL-cloneprd2/src/server/SimulationServer.js`
- Main server implementation
- Handles WebSocket connections and broadcasts
- Contains `SimulationController`, `RouteSystem`, and `VirusSystem` classes
- Manages real-time updates and client communications
- Recently modified to handle virus growth patterns and spawning

2. `SpreadGL-cloneprd2/src/dev-server.js`
- Development server setup
- Express application configuration
- API endpoints for simulation control
- Serves the development panel interface
- Recently updated to include virus spawn controls and pattern selection

### Component Files
3. `SpreadGL-cloneprd2/src/components/VirusSystem.js`
- Core virus simulation logic
- Implements virus point generation and growth patterns
- Manages virus state and parameters
- Recently enhanced with NORMAL, VECTOR, and BURST patterns

4. `SpreadGL-cloneprd2/src/components/OutbreakVirus.js`
- Advanced virus behavior implementation
- Contains growth state management
- Territory and point tracking systems
- Used as reference for virus mechanics

### Configuration Files
5. `SpreadGL-cloneprd2/package.json`
- Project dependencies
- Build scripts and configurations
- Development tools setup
- Recently updated to include WebSocket dependencies

### Map Visualization
6. `contagion.demosite.1/src/components/MapViewer.tsx`
- Map visualization component
- DeckGL and MapLibre integration
- Layer rendering for routes and virus points
- Recently modified for improved visual presentation

### Recent Changes Overview:
- Added dynamic virus spawning with multiple patterns
- Implemented real-time status updates
- Enhanced visualization of virus spread
- Improved error handling and state management
- Added pattern-specific behaviors and visual indicators

### Key Interactions:
1. Client-Server Communication:
   - WebSocket connections for real-time updates
   - REST endpoints for control actions
   - State synchronization between client and server

2. Virus System:
   - Point generation and management
   - Growth pattern implementation
   - State tracking and updates

3. Development Interface:
   - Control panel for virus spawning
   - Pattern selection and visualization
   - Status monitoring and feedback

### Future Development Plans:

1. Docker Environment Migration
   - Containerize SpreadGL server system
   - Create Docker configuration files
   - Set up environment variables for flexible deployment
   - Ensure WebSocket compatibility in containerized environment

2. Bitquery Integration for Solana Token Tracking
   - Implement real-time data streaming for:
     - Token price monitoring
     - Market cap tracking
     - Trade activity observation
     - Holder statistics
   - Focus on single Solana token address monitoring
   - Integrate with existing visualization system

3. Website Migration Requirements
   - Components to Transfer:
     - Virus System (NORMAL, VECTOR, BURST patterns)
     - Route Visualization System
     - Development Control Panel
     - WebSocket Communication Layer
   - New Components Needed:
     - Updated UI/UX design
     - Token Data Display Interface
     - Enhanced Control Panel

4. Netlify Deployment Optimization
   - Current Challenge: Local host dependency
   - Required Changes:
     - Update WebSocket connection handling
     - Implement environment-based configuration
     - Modify dev server control panel access
     - Add production environment variables
   - Goals:
     - Maintain dev server control functionality
     - Enable remote WebSocket connections
     - Ensure seamless production deployment

This workflow represents a real-time simulation system with focus on virus spread visualization and control, built on a WebSocket-based architecture with modern web technologies.

Would you like me to elaborate on any specific aspect of these files or their interactions?
