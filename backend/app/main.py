from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_session import Session
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure CORS with explicit settings - include port 5174
CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type"])

# Manual CORS handler as fallback (runs after Flask-CORS)
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    
    # Allow requests from frontend origins - include port 5174
    if origin in ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Type'
    
    # Handle preflight OPTIONS requests
    if request.method == 'OPTIONS':
        response.status_code = 200
    
    return response

# Session configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sessions')
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_PERMANENT'] = False

# Create sessions directory if it doesn't exist
os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)

# Initialize session
Session(app)

# Serve static images from data directory
@app.route('/api/images/<path:filepath>')
def serve_image(filepath):
    """Serve PNG images from the data directory"""
    try:
        # Get the backend directory
        backend_dir = os.path.dirname(os.path.dirname(__file__))
        data_dir = os.path.join(backend_dir, 'data')
        
        # Security: Only allow PNG files
        if not filepath.endswith('.png'):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Construct full path
        full_path = os.path.join(data_dir, filepath)
        
        # Security: Ensure file is within data directory (prevent path traversal)
        data_dir_abs = os.path.abspath(data_dir)
        full_path_abs = os.path.abspath(full_path)
        
        if not full_path_abs.startswith(data_dir_abs):
            return jsonify({'error': 'Access denied'}), 403
        
        if os.path.exists(full_path):
            # Get directory and filename
            directory = os.path.dirname(full_path)
            filename = os.path.basename(full_path)
            return send_from_directory(directory, filename)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Import routes after app initialization
from app.routes import *

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

