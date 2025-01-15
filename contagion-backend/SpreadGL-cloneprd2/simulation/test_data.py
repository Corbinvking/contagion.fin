def generate_test_data():
    return {
        "event": "simulation_update",
        "data": {
            "global": {
                "infected": 1200000,
                "deaths": 50000,
                "cure_progress": 15
            },
            "countries": [
                {
                    "name": "USA",
                    "infected": 500000,
                    "deaths": 10000,
                    "boundaries": {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-95.7129, 37.0902]
                        }
                    }
                },
                {
                    "name": "China",
                    "infected": 300000,
                    "deaths": 5000,
                    "boundaries": {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [104.1954, 35.8617]
                        }
                    }
                }
            ],
            "routes": [
                {
                    "fromCoordinates": [-95.7129, 37.0902],
                    "toCoordinates": [104.1954, 35.8617],
                    "intensity": 0.8,
                    "type": "plane"
                }
            ]
        }
    } 