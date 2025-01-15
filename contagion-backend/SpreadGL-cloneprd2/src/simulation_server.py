from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import time
import simulation_engine  # Your existing simulation code

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    start_simulation()

def start_simulation():
    while True:
        simulation_data = simulation_engine.run_step()
        socketio.emit('simulation_update', simulation_data)
        time.sleep(0.1)  # Adjust frequency as needed

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000) 