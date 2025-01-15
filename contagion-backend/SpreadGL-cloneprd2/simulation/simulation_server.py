from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import time
import random

app = Flask(__name__)
CORS(app)

def generate_test_data():
    return {
        "data": {
            "global": {
                "infected": random.randint(1000000, 5000000),
                "deaths": random.randint(10000, 100000),
                "cure_progress": random.randint(0, 100)
            },
            "countries": [
                {
                    "name": "USA",
                    "infected": random.randint(100000, 1000000),
                    "deaths": random.randint(1000, 10000)
                }
            ],
            "routes": [
                {
                    "from": "USA",
                    "to": "UK",
                    "type": "plane"
                }
            ]
        }
    }

@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "Simulation server is running",
        "time": time.time()
    })

@app.route('/test')
def test():
    return jsonify({
        "message": "Test endpoint is working",
        "timestamp": time.time()
    })

@app.route('/simulation')
def get_simulation():
    return jsonify(generate_test_data())

socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    logger=True
)

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit_data()

def emit_data():
    try:
        data = generate_test_data()
        print("Emitting simulation data...")
        socketio.emit('simulation_update', data)
    except Exception as e:
        print(f"Error in emit_data: {e}")

if __name__ == '__main__':
    print("Starting server...")
    socketio.run(
        app, 
        host='0.0.0.0',
        port=5000,
        debug=True
    ) 