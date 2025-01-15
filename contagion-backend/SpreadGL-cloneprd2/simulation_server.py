from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import time
import random  # For demo purposes

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

def generate_mock_data():
    return {
        "infected": random.randint(1000, 10000),
        "locations": [
            {"lat": random.uniform(-90, 90), 
             "lng": random.uniform(-180, 180), 
             "intensity": random.random()}
            for _ in range(10)
        ]
    }

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('start_simulation')
def handle_start():
    while True:
        simulation_data = generate_mock_data()
        socketio.emit('simulation_update', simulation_data)
        time.sleep(1)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True) 