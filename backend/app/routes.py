from flask import Blueprint, request, jsonify, session
from app.main import app
from app.auth import generate_otp, send_otp_email, store_otp, verify_otp, cleanup_expired_otps
import re

# Create blueprint for auth routes
auth_bp = Blueprint('auth', __name__)


def is_valid_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@auth_bp.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    """Send OTP to user's email"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        # Validate email
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Cleanup expired OTPs
        cleanup_expired_otps()
        
        # Generate OTP
        otp = generate_otp(6)
        
        # Store OTP
        store_otp(email, otp)
        
        # Send email
        email_sent = send_otp_email(email, otp)
        
        if email_sent:
            return jsonify({
                'success': True,
                'message': 'OTP sent successfully to your email'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to send OTP. Please check email configuration or try again later.'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@auth_bp.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp_route():
    """Verify OTP and create session"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        # Validate input
        if not email or not otp:
            return jsonify({'success': False, 'message': 'Email and OTP are required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Verify OTP
        is_valid, message = verify_otp(email, otp)
        
        if is_valid:
            # Create session
            session['user_email'] = email
            session['authenticated'] = True
            session.permanent = True
            
            return jsonify({
                'success': True,
                'message': message,
                'user': {
                    'email': email
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@auth_bp.route('/api/auth/check-session', methods=['GET'])
def check_session():
    """Check if user is authenticated"""
    try:
        if session.get('authenticated') and session.get('user_email'):
            return jsonify({
                'success': True,
                'authenticated': True,
                'user': {
                    'email': session.get('user_email')
                }
            }), 200
        else:
            return jsonify({
                'success': True,
                'authenticated': False
            }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    try:
        session.clear()
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


# Register blueprint
app.register_blueprint(auth_bp)

