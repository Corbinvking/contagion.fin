# Geospatial Spawn Controller for Virus Simulation

### **Overview**
The Geospatial Spawn Controller ensures virus spore spawning adheres to predefined latitude-longitude points, maintaining a realistic and landlocked simulation. It integrates with the existing virus system and provides structured, reusable functionality.

---

### **Objectives**
1. Maintain a granular database of predefined longitude-latitude points for every country.
2. Simulate natural and organic spread by querying the nearest predefined point to the current position.
3. Enable detailed calculations of total virus coverage on the world map.
4. Provide a modular, reusable tool for integration with the existing simulation system.

---

### **Plan of Action**

#### **1. Data Structure for Predefined Points**
- Create a hierarchical structure mapping:
  - **Country > Region/State > List of Points**

**Example JSON:**
```json
{
  "USA": {
    "California": [
      {"lat": 34.0522, "lng": -118.2437}, 
      {"lat": 36.7783, "lng": -119.4179}
    ],
    "New York": [
      {"lat": 40.7128, "lng": -74.0060},
      {"lat": 42.6526, "lng": -73.7562}
    ]
  },
  "Canada": {
    "Ontario": [
      {"lat": 43.65107, "lng": -79.347015},
      {"lat": 45.4215, "lng": -75.6972}
    ]
  }
}
```

#### **2. Geospatial Logic**
- Use a nearest-neighbor algorithm (e.g., KD-Tree or Haversine formula) to find the closest predefined point to a given position.

#### **3. Integration with `VirusSystem`**
- Replace random spread logic with deterministic selection of predefined points.
- Implement fallback mechanisms for cases with no nearby points.

#### **4. Implementation Steps**
- Build the controller as a separate module.
- Integrate it into the `calculateNextPosition` function of `VirusPoint`.

---

### **Implementation**

#### **Geospatial Spawn Controller**

```javascript
class GeospatialSpawnController {
    constructor(predefinedPoints) {
        this.points = predefinedPoints; // Load predefined points from JSON or database
    }

    findNearestPoint(currentPosition) {
        const { lat: currLat, lng: currLng } = currentPosition;

        let nearest = null;
        let minDistance = Infinity;

        // Iterate through all predefined points
        Object.values(this.points).forEach((country) => {
            Object.values(country).forEach((region) => {
                region.forEach((point) => {
                    const distance = this.calculateDistance(
                        currLat,
                        currLng,
                        point.lat,
                        point.lng
                    );

                    if (distance < minDistance) {
                        nearest = point;
                        minDistance = distance;
                    }
                });
            });
        });

        return nearest;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const toRadians = (deg) => (deg * Math.PI) / 180;

        const R = 6371; // Earth radius in km
        const dLat = toRadians(lat2 - lat1);
        const dLng = toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
                Math.cos(toRadians(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in km
    }
}
```

#### **Integration into Virus System**

Modify `VirusPoint` to utilize the `GeospatialSpawnController`:

```javascript
import GeospatialSpawnController from './GeospatialSpawnController';
import predefinedPoints from './predefinedPoints.json'; // Load points from JSON

const geoController = new GeospatialSpawnController(predefinedPoints);

class VirusPoint {
    calculateNextPosition(pattern = 'NORMAL') {
        const config = GROWTH_PATTERNS[pattern];
        const now = Date.now();

        if (now - this.lastSpreadTime < config.tickRate) {
            return null;
        }

        const nearestPoint = geoController.findNearestPoint({
            lat: this.position[0],
            lng: this.position[1]
        });

        if (nearestPoint) {
            this.lastSpreadTime = now;
            return [nearestPoint.lat, nearestPoint.lng];
        } else {
            console.warn('No nearby spawn point found, skipping...');
            return null;
        }
    }
}
```

#### **Integration into Simulation Server**

Update the `SimulationController` to use the `GeospatialSpawnController` for initializing and updating spore points:

```javascript
initialize() {
    this.virusSystem = new VirusSystem();
    this.geoController = new GeospatialSpawnController(predefinedPoints);
    console.log('Initialized virus system with geospatial control');
}
```

---

### **Future Enhancements**

1. **Dynamic Expansion:**
   - Allow dynamically adding new points to the predefined list during runtime.

2. **Precision Levels:**
   - Offer different levels of granularity (e.g., city-level, state-level) based on performance and use case.

3. **Visualization:**
   - Overlay predefined points on the simulation map for debugging and analysis.

4. **Caching Nearby Points:**
   - Implement a cache for nearby points to optimize performance in high-frequency updates.

---

### **Conclusion**

The Geospatial Spawn Controller ensures full control over spore spawning, keeps the simulation realistic, and enables detailed calculations for virus coverage. This approach integrates seamlessly with the existing system, providing a foundation for future enhancements. Let me know if you need additional details or support with implementation!

