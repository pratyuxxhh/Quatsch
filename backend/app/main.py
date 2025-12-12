from flask import Flask, request, jsonify
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

# Import routes after app initialization
from app.routes import *

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

