# Migration Guide for SpreadGL Project

make sure your in the right directory : cd contagion-backend


## Essential Files for Migration

### 1. Core Server Components
Required files from `SpreadGL-cloneprd2/src/server/`:
```
SimulationServer.js  # Main server implementation
```
Dependencies:
- WebSocket handling
- Route system
- Virus system

### 2. Development Server
Required files from `SpreadGL-cloneprd2/src/`:
```
dev-server.js  # Development control panel and API endpoints
```
Dependencies:
- Express configuration
- API routes
- WebSocket setup

### 3. Virus System Components
Required files from `SpreadGL-cloneprd2/src/components/`:
```
VirusSystem.js  # Core virus logic and patterns
```
Key functionality:
- Growth patterns (NORMAL, VECTOR, BURST)
- Point generation
- State management

### 4. Configuration
Required files from root:
```
package.json  # Core dependencies and scripts
```

## Files to Exclude
1. `OutbreakVirus.js` - Only used as reference, not actively used
2. Any test or temporary files
3. Backup or duplicate files
4. Old configuration files

## Migration Steps

1. **Create New Project Structure**
```
new-project/
├── src/
│   ├── server/
│   │   └── SimulationServer.js
│   ├── components/
│   │   └── VirusSystem.js
│   └── dev-server.js
└── package.json
```

2. **Dependencies Setup**
Essential packages to include:
- ws (WebSocket)
- express
- deck.gl
- maplibre-gl
- Other core dependencies from package.json

3. **Configuration Updates**
- Update WebSocket connection URLs
- Configure environment variables
- Set up development and production endpoints

4. **Integration Testing**
Test core functionalities:
- WebSocket connections
- Virus spawning
- Pattern selection
- Route visualization
- Development panel controls

## Potential Breaking Points

1. **WebSocket Connections**
- Check connection URLs
- Verify client-server handshake
- Test connection stability

2. **State Management**
- Verify virus state updates
- Confirm pattern behavior
- Test point generation

3. **API Endpoints**
- Validate all control endpoints
- Test response formats
- Check error handling

4. **Development Panel**
- Verify all controls work
- Test status updates
- Confirm visualization updates

## Post-Migration Verification

1. **Functionality Checklist**
- [ ] Server starts without errors
- [ ] WebSocket connections establish
- [ ] Virus spawning works
- [ ] All patterns function correctly
- [ ] Development panel responds
- [ ] Route system operates
- [ ] State updates properly

2. **Performance Checks**
- [ ] Memory usage is stable
- [ ] Updates are smooth
- [ ] No connection drops
- [ ] Pattern transitions work

## Notes
- Keep original files backed up until migration is verified
- Test each component individually before full integration
- Document any configuration changes needed
- Maintain error logging for debugging

Would you like me to elaborate on any part of this migration plan?
